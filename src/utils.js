import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar tokens JWT. Se toma de .env (JWT_SECRET);
// el valor de la derecha es solo un fallback para no romper en desarrollo
// si alguien se olvida de definirla — en producción SIEMPRE debe venir del .env.
export const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretJWT2026';

/**
 * CONSIGNA - Punto 2: Encriptación de Contraseña
 * Genera el hash síncrono de una contraseña usando bcrypt.hashSync,
 * tal como pide la consigna. Se invoca desde la estrategia "register"
 * de Passport (src/config/passport.config.js) antes de guardar el usuario.
 * @param {string} password Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * Usada por la estrategia "login" de Passport para validar credenciales.
 * @param {Object} user Objeto del usuario con la contraseña hasheada
 * @param {string} password Contraseña en texto plano a verificar
 * @returns {boolean} true si coinciden, false en caso contrario
 */
export const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

/**
 * CONSIGNA - Punto 4: Sistema de Login con JWT
 * Genera el token JWT firmado que el router de sesiones entrega como
 * cookie httpOnly al loguearse (ver POST /api/sessions/login).
 * @param {Object} user Datos del usuario
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Extrae el token JWT desde las cookies de la petición HTTP.
 * Usado por la estrategia "current" (passport-jwt) para validar al
 * usuario logueado — ver Punto 5 de la consigna en sessions.router.js.
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