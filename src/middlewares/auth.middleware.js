// src/middlewares/auth.middleware.js
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, cookieExtractor } from '../utils.js';
import { userModel } from '../models/user.model.js';

/**
 * Middleware GLOBAL (no bloquea). Si hay una cookie JWT válida, resuelve
 * el usuario contra la base de datos y lo expone en req.user y res.locals.user
 * para que las vistas (navbar, etc.) sepan si hay sesión activa o no.
 * Si el token falta, es inválido o expiró, simplemente sigue como visitante anónimo.
 */
export const loadUser = async (req, res, next) => {
    try {
        const token = cookieExtractor(req);
        if (!token) return next();

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.user._id ?? decoded.user.id).lean();

        if (user) {
            delete user.password;
            req.user = user;
            res.locals.user = user;
            res.locals.isAdmin = user.role === 'admin';
        }
    } catch (error) {
        // Token vencido o manipulado: no rompe la request, solo no queda logueado
    }
    next();
};

/**
 * Middleware para proteger VISTAS. Depende de loadUser (debe ir montado antes
 * en app.js). Si no hay usuario resuelto desde el JWT, redirige a /login.
 */
export const isAuth = (req, res, next) => {
    if (req.user) {
        return next();
    }
    return res.redirect('/login');
};

/**
 * Middleware para proteger rutas de visitantes (como /login o /register).
 * Si el usuario ya está autenticado, lo redirige al catálogo (/products).
 */
export const isGuest = (req, res, next) => {
    if (req.user) {
        return res.redirect('/products');
    }
    return next();
};

/**
 * Middleware para proteger VISTAS que solo puede ver un administrador.
 * Debe usarse después de isAuth. Si el usuario logueado no es admin,
 * lo redirige al catálogo en vez de dejarlo pasar.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.redirect('/products');
};

/**
 * Envuelve passport.authenticate en una estrategia dada, devolviendo
 * SIEMPRE un error controlado (JSON) en vez del comportamiento por
 * defecto de Passport, que corta la petición sin cuerpo claro.
 *
 * Uso: router.get('/current', passportCall('current'), handler)
 */
export const passportCall = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Error interno de autenticación.' });
            }
            if (!user) {
                // Token inválido, inexistente o expirado -> error apropiado de Passport
                return res.status(401).json({
                    status: 'error',
                    message: info?.message ?? 'No autorizado: token inválido o inexistente.'
                });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};

/**
 * Middleware de AUTORIZACIÓN por rol. Debe usarse después de passportCall('current'),
 * ya que depende de req.user.
 *
 * Uso: router.delete('/:uid', passportCall('current'), authorization(['admin']), handler)
 */
export const authorization = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autorizado.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'No tienes permisos para realizar esta acción.' });
        }
        next();
    };
};

/**
 * Middleware de AUTORIZACIÓN sobre carritos. Debe usarse después de passportCall('current').
 * Un admin puede operar sobre cualquier carrito; un usuario normal solo sobre el suyo
 * (el que quedó referenciado en su propio documento User al registrarse).
 */
export const isCartOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No autorizado.' });
    }
    if (req.user.role === 'admin') {
        return next();
    }
    const { cid } = req.params;
    if (!req.user.cart || req.user.cart.toString() !== cid) {
        return res.status(403).json({ status: 'error', message: 'No tienes permisos para operar sobre este carrito.' });
    }
    return next();
};
