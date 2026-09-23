// src/utils/jwt.util.js
import jwt from 'jsonwebtoken';

// Clave secreta para firmar tokens JWT. Se toma de .env (JWT_SECRET);
// el valor de la derecha es solo un fallback para no romper en desarrollo
// si alguien se olvida de definirla — en producción SIEMPRE debe venir del .env.
export const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretJWT2026';

/**
 * CONSIGNA - Sistema de Login con JWT
 * Genera el token JWT firmado que el router de sesiones entrega como
 * cookie httpOnly al loguearse.
 * @param {Object} user Datos del usuario
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Extrae el token JWT desde las cookies de la petición HTTP.
 * Usado por la estrategia "current" (passport-jwt) para validar al
 * usuario logueado, y por loadUser (auth.middleware.js).
 * @param {Object} req Petición de Express
 * @returns {string|null} Token JWT o null si no existe
 */
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['coderCookieToken'];
    }
    return token;
};
