// src/models/passwordToken.model.js
import { Schema, model } from 'mongoose';

/**
 * CONSIGNA - Punto 3: Sistema de Recuperación de Contraseña
 * Cada solicitud de "olvidé mi contraseña" crea uno de estos documentos.
 * `expiresAt` se fija a 1 hora desde su creación (ver
 * passwordRecovery.repository.js), y el índice TTL de abajo hace que
 * MongoDB borre el documento automáticamente una vez vencido — pero
 * el chequeo real de expiración se hace igual "a mano" en el
 * repository antes de confiar en el token, porque el barrido TTL de
 * Mongo no es instantáneo (corre cada ~60s).
 */
const passwordTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice TTL: MongoDB elimina el documento apenas se cumple expiresAt
passwordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const passwordTokenModel = model('passwordTokens', passwordTokenSchema);
