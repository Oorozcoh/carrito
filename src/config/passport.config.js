// src/config/passport.config.js
//
// CONSIGNA - Punto 3: Estrategias de Passport
// Este archivo desarrolla las 3 estrategias de Passport que trabajan
// sobre el modelo User: "register" y "login" (passport-local) y
// "current" (passport-jwt, la estrategia de autenticación mediante JWT
// que pide la consigna).
//
// A partir de la entrega final, estas estrategias ya NO tocan el
// modelo de Mongoose directamente: delegan en userRepository (patrón
// Repository, Punto 1 de la consigna final), que a su vez usa el DAO.
import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import userRepository from '../repositories/user.repository.js';
import { isValidPassword } from '../utils/password.util.js';
import { JWT_SECRET, cookieExtractor } from '../utils/jwt.util.js';
import { ApiError } from '../errors/ApiError.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

/**
 * Qué proveedores de login social están realmente configurados (tienen
 * client ID + secret en el .env). Se calcula una sola vez, al cargar
 * este módulo, y lo usan tanto initializePassport() (para decidir qué
 * estrategias registrar) como sessions.router.js (para decidir qué
 * rutas montar) y las vistas (para decidir qué botones mostrar) — así
 * el login local nunca se rompe si todavía no armaste alguna app OAuth.
 */
export const oauthProviders = {
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    microsoft: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
};

const initializePassport = () => {

    // ---------------------------------------------------------------
    // Estrategia "register": delega en userRepository.registerUser(),
    // que valida email único, hashea el password con bcrypt.hashSync
    // (Punto 2) y crea el carrito propio del usuario (Punto 1: campo
    // `cart` del modelo User) — todo a través del Repository/DAO.
    // ---------------------------------------------------------------
    passport.use('register', new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, email, age } = req.body;

                if (!first_name || !last_name || !email || !age || !password) {
                    return done(null, false, { message: 'Todos los campos son obligatorios.' });
                }

                const newUser = await userRepository.registerUser({ first_name, last_name, email, age, password });
                return done(null, newUser);
            } catch (error) {
                if (error instanceof ApiError) {
                    return done(null, false, { message: error.message });
                }
                return done(error);
            }
        }
    ));

    // ---------------------------------------------------------------
    // Estrategia "login": valida credenciales contra la base de datos
    // (vía userRepository). Es la mitad "Passport" del Punto 4 de la
    // consigna (Sistema de Login) — la emisión del JWT ocurre en
    // sessions.router.js una vez que esta estrategia confirma la
    // identidad del usuario.
    // ---------------------------------------------------------------
    passport.use('login', new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            try {
                const user = await userRepository.getByEmail(email);

                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado.' });
                }

                if (!isValidPassword(user, password)) {
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // ---------------------------------------------------------------
    // Estrategia "current": estrategia de autenticación mediante JWT
    // que pide el Punto 4 de la consigna. Valida el JWT (cookie httpOnly
    // o header Bearer) y reconsulta al usuario en la base de datos (vía
    // userRepository) para devolver datos frescos (no lo que quedó
    // "congelado" en el payload del token). Es la estrategia que usa
    // GET /api/sessions/current (Punto 5 de la consigna anterior, ahora
    // adaptada para responder un DTO — ver Punto 2 de la consigna final
    // en sessions.router.js) a través de passportCall('current').
    // ---------------------------------------------------------------
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([
                cookieExtractor,
                ExtractJWT.fromAuthHeaderAsBearerToken()
            ]),
            secretOrKey: JWT_SECRET
        },
        async (jwt_payload, done) => {
            try {
                const user = await userRepository.getById(jwt_payload.user._id ?? jwt_payload.user.id);

                if (!user) {
                    // "en caso de token inválido o inexistente, se devuelve un
                    // error apropiado de Passport" — acá cubrimos el caso de
                    // un token válido mas para un usuario que ya no existe
                    // (fue borrado después de emitido el token).
                    return done(null, false, { message: 'El usuario del token ya no existe.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    ));

    // ---------------------------------------------------------------
    // Login social: GitHub, Google y Microsoft comparten la misma
    // lógica de negocio (userRepository.findOrCreateOAuthUser) — lo
    // único que cambia es cómo cada proveedor entrega el perfil.
    // ---------------------------------------------------------------
    const handleOAuthProfile = (provider) => async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value ?? null;
            const [first_name, ...rest] = (profile.displayName || profile.username || 'Usuario').split(' ');

            const user = await userRepository.findOrCreateOAuthUser({
                provider,
                providerId: profile.id,
                email,
                first_name,
                last_name: rest.join(' ')
            });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    };

    if (oauthProviders.github) {
        passport.use('github', new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
                scope: ['user:email']
            },
            handleOAuthProfile('github')
        ));
    } else {
        console.warn('⚠️  Login con GitHub deshabilitado: faltan GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET en el .env.');
    }

    if (oauthProviders.google) {
        passport.use('google', new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            handleOAuthProfile('google')
        ));
    } else {
        console.warn('⚠️  Login con Google deshabilitado: faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET en el .env.');
    }

    if (oauthProviders.microsoft) {
        passport.use('microsoft', new MicrosoftStrategy(
            {
                clientID: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                callbackURL: process.env.MICROSOFT_CALLBACK_URL,
                // 'common' (default) = cuentas personales Y educativas/laborales mezcladas.
                // 'organizations' = SOLO cuentas educativas/laborales (de cualquier institución).
                // 'consumers' = SOLO cuentas personales (outlook.com, hotmail, live.com).
                // <tenant-id> = solo la institución con ese ID de tenant específico.
                tenant: process.env.MICROSOFT_TENANT || 'common',
                scope: ['user.read']
            },
            handleOAuthProfile('microsoft')
        ));
    } else {
        console.warn('⚠️  Login con Microsoft deshabilitado: faltan MICROSOFT_CLIENT_ID/MICROSOFT_CLIENT_SECRET en el .env.');
    }
};

export default initializePassport;
