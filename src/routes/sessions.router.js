// src/routes/sessions.router.js
import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils.js';
import { passportCall } from '../middlewares/auth.middleware.js';

const router = Router();

// ---------------------------------------------------------------
// POST /api/sessions/register
// Crea el usuario vía la estrategia "register" (hashea password,
// valida email único, crea su carrito). No autentica automáticamente:
// el usuario hace login por separado.
// ---------------------------------------------------------------
router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Error en registro:', err);
            return res.status(500).json({ status: 'error', message: 'Error interno al registrar el usuario.' });
        }
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: info?.message ?? 'No fue posible completar el registro.'
            });
        }
        return res.status(201).json({
            status: 'success',
            message: 'Usuario registrado correctamente.',
            payload: user // el .toJSON() del modelo ya excluye el password
        });
    })(req, res, next);
});

// ---------------------------------------------------------------
// POST /api/sessions/login
// Valida credenciales vía la estrategia "login" y, si son correctas,
// firma un JWT y lo entrega como cookie httpOnly (no accesible por JS
// en el cliente, mitigando robo de token vía XSS).
// ---------------------------------------------------------------
router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ status: 'error', message: 'Error interno al iniciar sesión.' });
        }
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: info?.message ?? 'Credenciales inválidas.'
            });
        }

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

        return res.status(200).json({
            status: 'success',
            message: 'Autenticación exitosa',
            redirectUrl: '/products'
        });
    })(req, res, next);
});

// ---------------------------------------------------------------
// GET /api/sessions/current
// Valida el JWT (estrategia "current") y devuelve los datos del
// usuario logueado. Si el token falta o es inválido, passportCall
// ya responde 401 con un mensaje claro antes de llegar aquí.
// ---------------------------------------------------------------
router.get('/current', passportCall('current'), (req, res) => {
    return res.status(200).json({
        status: 'success',
        payload: req.user
    });
});

// ---------------------------------------------------------------
// GET /api/sessions/logout
// Limpia la cookie del JWT y redirige al login (usada por la navbar).
// ---------------------------------------------------------------
router.get('/logout', (req, res) => {
    res.clearCookie('coderCookieToken');
    if (req.session) {
        req.session.destroy(() => res.redirect('/login'));
    } else {
        res.redirect('/login');
    }
});

export default router;
