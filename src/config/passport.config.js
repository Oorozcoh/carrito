// src/config/passport.config.js
import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { userModel } from '../models/user.model.js';
import { cartModel } from '../models/cart.model.js';
import { createHash, isValidPassword, JWT_SECRET, cookieExtractor } from '../utils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

    // ---------------------------------------------------------------
    // Estrategia "register": crea el usuario, hashea el password con
    // bcrypt.hashSync y le asigna un carrito propio en Carts.
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

                const exists = await userModel.findOne({ email });
                if (exists) {
                    return done(null, false, { message: 'Ya existe un usuario registrado con ese email.' });
                }

                // Cada usuario nuevo obtiene su propio carrito vacío
                const newCart = await cartModel.create({ products: [] });

                const newUser = await userModel.create({
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password), // bcrypt.hashSync vía utils.js
                    cart: newCart._id
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // ---------------------------------------------------------------
    // Estrategia "login": valida credenciales contra la base de datos.
    // No emite el JWT aquí -- eso ocurre en el router, una vez que
    // Passport confirma la identidad del usuario.
    // ---------------------------------------------------------------
    passport.use('login', new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email });

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
    // Estrategia "current": valida el JWT (cookie httpOnly o Bearer)
    // y reconsulta al usuario en la base de datos para devolver datos
    // frescos (no lo que quedó "congelado" en el payload del token).
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
                const user = await userModel.findById(jwt_payload.user._id ?? jwt_payload.user.id);

                if (!user) {
                    return done(null, false, { message: 'El usuario del token ya no existe.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    ));
};

export default initializePassport;
