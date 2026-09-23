// src/controllers/session.controller.js
//
// Capa Controller: recibe (req, res, next), delega la lógica de negocio
// en repositories/estrategias de Passport, y arma la respuesta HTTP.
// Los routers (routes/sessions.router.js) solo conectan URL + middleware
// + esta función — no contienen lógica propia.
import passport from 'passport';
import { generateToken } from '../utils/jwt.util.js';
import { CurrentUserDTO } from '../dto/user.dto.js';
import passwordRecoveryRepository from '../repositories/passwordRecovery.repository.js';
import { ApiError } from '../errors/ApiError.js';

/**
 * Firma el JWT de sesión y lo entrega como cookie httpOnly. Compartido
 * por el login local y el login social (mismo token, misma cookie,
 * evita repetir la construcción del payload en cada handler).
 */
const issueSessionCookie = (res, user) => {
    const token = generateToken({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart
    });

    res.cookie('coderCookieToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24h, igual al expiresIn del JWT
    });
};

/**
 * POST /api/sessions/register
 * Crea el usuario vía la estrategia "register" (hashea password,
 * valida email único, crea su carrito).
 */
export const register = (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return next(ApiError.badRequest(info?.message ?? 'No fue posible completar el registro.'));
        }
        return res.status(201).json({
            status: 'success',
            message: 'Usuario registrado correctamente.',
            payload: user // el .toJSON() del modelo ya excluye el password
        });
    })(req, res, next);
};

/**
 * CONSIGNA - Sistema de Login con JWT
 * POST /api/sessions/login
 * Valida credenciales vía la estrategia "login" y, si son correctas,
 * genera un JWT y lo entrega como cookie httpOnly.
 */
export const login = (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return next(ApiError.unauthorized(info?.message ?? 'Credenciales inválidas.'));
        }

        issueSessionCookie(res, user);

        return res.status(200).json({
            status: 'success',
            message: 'Autenticación exitosa',
            redirectUrl: '/products'
        });
    })(req, res, next);
};

/**
 * Login social (GitHub/Google/Microsoft) — handler COMPARTIDO por las
 * 3 rutas de callback. Cuando llega acá, la estrategia de Passport
 * correspondiente ya resolvió (o creó) el usuario vía
 * userRepository.findOrCreateOAuthUser() y lo dejó en req.user. Desde
 * acá en adelante es exactamente el mismo flujo que el login local:
 * mismo JWT, misma cookie httpOnly, mismo destino — solo que redirige
 * en vez de responder JSON, porque este endpoint lo abre el navegador
 * directamente (no un fetch()).
 */
export const oauthCallback = (req, res) => {
    issueSessionCookie(res, req.user);
    return res.redirect('/products');
};

/**
 * CONSIGNA - Modificación de la ruta /current
 * GET /api/sessions/current
 * Devuelve un DTO (no el documento completo de Mongo) del usuario
 * ya validado por el middleware passportCall('current').
 */
export const current = (req, res) => {
    return res.status(200).json({
        status: 'success',
        payload: new CurrentUserDTO(req.user)
    });
};

/**
 * GET /api/sessions/logout
 * Limpia la cookie del JWT y redirige al login (usada por la navbar).
 */
export const logout = (req, res) => {
    res.clearCookie('coderCookieToken');
    if (req.session) {
        req.session.destroy(() => res.redirect('/login'));
    } else {
        res.redirect('/login');
    }
};

/**
 * CONSIGNA - Sistema de Recuperación de Contraseña
 * POST /api/sessions/forgot-password
 * Siempre responde el mismo mensaje exista o no el email, para no
 * revelar qué correos están registrados en el sistema.
 */
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw ApiError.badRequest('El email es obligatorio.');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    await passwordRecoveryRepository.requestReset(email, baseUrl);

    return res.status(200).json({
        status: 'success',
        message: 'Si el email existe en nuestro sistema, te enviamos un correo con las instrucciones.'
    });
};

/**
 * CONSIGNA - Sistema de Recuperación de Contraseña
 * POST /api/sessions/reset-password
 * Valida el token (existencia, uso previo, expiración de 1 hora) y
 * aplica la nueva contraseña, siempre que sea distinta a la anterior.
 */
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw ApiError.badRequest('Faltan datos para restablecer la contraseña.');
    }

    await passwordRecoveryRepository.resetPassword(token, newPassword);

    return res.status(200).json({
        status: 'success',
        message: 'Contraseña actualizada correctamente. Ya podés iniciar sesión.'
    });
};
