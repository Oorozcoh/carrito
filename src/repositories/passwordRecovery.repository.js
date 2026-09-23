// src/repositories/passwordRecovery.repository.js
//
// CONSIGNA - Punto 3: Sistema de Recuperación de Contraseña
// Orquesta las tres reglas pedidas:
//   1) envía un correo con un botón para restablecer la contraseña,
//   2) el enlace expira 1 hora después de generado,
//   3) no se puede restablecer a la misma contraseña que ya tenía.
import crypto from 'crypto';
import PasswordTokenDAO from '../dao/passwordToken.dao.js';
import userRepository from './user.repository.js';
import { createHash, isValidPassword } from '../utils/password.util.js';
import { sendPasswordResetEmail } from '../services/mail.service.js';
import { ApiError } from '../errors/ApiError.js';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora, tal como pide la consigna

class PasswordRecoveryRepository {
    constructor() {
        this.tokenDao = new PasswordTokenDAO();
    }

    /**
     * Genera el token, lo guarda con vencimiento a 1 hora y dispara el
     * correo con el enlace de restablecimiento.
     * @param {string} email
     * @param {string} baseUrl Origen de la app (protocolo + host) para armar el link
     */
    async requestReset(email, baseUrl) {
        const user = await userRepository.getByEmail(email);

        // No revelamos si el email existe o no (evita que alguien use
        // este endpoint para averiguar qué emails están registrados).
        if (!user) return;

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

        await this.tokenDao.create({ user: user._id, token, expiresAt });

        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, resetUrl);
    }

    /**
     * Valida el token y, si es válido y la nueva contraseña es distinta
     * a la anterior, la actualiza. Lanza ApiError.badRequest/notFound
     * según el caso, que el errorHandler global traduce a la respuesta.
     */
    async resetPassword(token, newPassword) {
        const tokenDoc = await this.tokenDao.findByToken(token);

        if (!tokenDoc) {
            throw ApiError.badRequest('El enlace de recuperación no es válido.');
        }
        if (tokenDoc.used) {
            throw ApiError.badRequest('Este enlace ya fue utilizado.');
        }
        if (tokenDoc.expiresAt.getTime() < Date.now()) {
            throw ApiError.badRequest('El enlace expiró. Solicitá uno nuevo.');
        }

        const user = await userRepository.getById(tokenDoc.user);
        if (!user) {
            throw ApiError.notFound('El usuario asociado a este enlace ya no existe.');
        }

        // Regla: no se puede restablecer a la misma contraseña anterior
        if (isValidPassword(user, newPassword)) {
            throw ApiError.badRequest('La nueva contraseña no puede ser igual a la anterior.');
        }

        await userRepository.updatePassword(user._id, createHash(newPassword));
        await this.tokenDao.markAsUsed(tokenDoc._id);
    }
}

export default new PasswordRecoveryRepository();
