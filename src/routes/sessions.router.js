// src/routes/sessions.router.js
//
// Router "delgado": solo define URL + middleware + controller.
// Toda la lógica vive en src/controllers/session.controller.js.
import { Router } from 'express';
import passport from 'passport';
import * as sessionController from '../controllers/session.controller.js';
import { passportCall } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { oauthProviders } from '../config/passport.config.js';

const router = Router();

router.post('/register', sessionController.register);
router.post('/login', sessionController.login);
router.get('/current', passportCall('current'), sessionController.current);
router.get('/logout', sessionController.logout);

router.post('/forgot-password', asyncHandler(sessionController.forgotPassword));
router.post('/reset-password', asyncHandler(sessionController.resetPassword));

// ---------------------------------------------------------------
// Login social (GitHub / Google / Microsoft)
// Cada par de rutas solo se monta si el proveedor tiene sus
// credenciales configuradas en el .env (ver oauthProviders en
// passport.config.js) — así un proveedor sin configurar no revienta
// el server, simplemente esas dos rutas no existen todavía.
// ---------------------------------------------------------------
if (oauthProviders.github) {
    router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));
    router.get(
        '/github/callback',
        passport.authenticate('github', { session: false, failureRedirect: '/login' }),
        sessionController.oauthCallback
    );
}

if (oauthProviders.google) {
    router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
    router.get(
        '/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        sessionController.oauthCallback
    );
}

if (oauthProviders.microsoft) {
    router.get('/microsoft', passport.authenticate('microsoft', { session: false, scope: ['user.read'] }));
    router.get(
        '/microsoft/callback',
        passport.authenticate('microsoft', { session: false, failureRedirect: '/login' }),
        sessionController.oauthCallback
    );
}

export default router;
