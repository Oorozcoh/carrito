import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar tokens JWT (se recomienda moverla a .env)
export const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretJWT2026';

/**
 * Genera el hash síncrono de una contraseña usando bcrypt
 * @param {string} password Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Compara una contraseña en texto plano con su hash almacenado
 * @param {Object} user Objeto del usuario con la contraseña hasheada
 * @param {string} password Contraseña en texto plano a verificar
 * @returns {boolean} true si coinciden, false en caso contrario
 */
export const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

/**
 * Genera un token JWT firmado para el usuario
 * @param {Object} user Datos del usuario
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Extrae el token JWT desde las cookies de la petición HTTP
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