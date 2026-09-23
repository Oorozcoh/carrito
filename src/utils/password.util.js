// src/utils/password.util.js
import bcrypt from 'bcrypt';

/**
 * CONSIGNA - Encriptación de Contraseña
 * Genera el hash síncrono de una contraseña usando bcrypt.hashSync.
 * Se invoca desde userRepository.registerUser() y desde el flujo de
 * recuperación de contraseña.
 * @param {string} password Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * Usada por la estrategia "login" de Passport y por la validación de
 * "no repetir la contraseña anterior" en la recuperación.
 * @param {Object} user Objeto del usuario con la contraseña hasheada
 * @param {string} password Contraseña en texto plano a verificar
 * @returns {boolean} true si coinciden, false en caso contrario
 */
export const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};
