// src/errors/errorHandler.middleware.js
//
// Middleware de error de Express (4 argumentos: err, req, res, next).
// Se registra UNA sola vez, al final de app.js, después de todas las
// rutas. Cualquier error que llegue acá vía next(error) — típicamente
// gracias a asyncHandler (ver src/utils/asyncHandler.util.js) — se
// traduce a una respuesta JSON consistente en toda la API.
import { ApiError } from './ApiError.js';

export const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ status: 'error', message: err.message });
    }

    // Error de Mongoose por índice único duplicado (ej: email o code repetido)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'campo';
        return res.status(409).json({ status: 'error', message: `Ya existe un registro con ese ${field}.` });
    }

    // Error de validación de Mongoose (campo requerido faltante, tipo incorrecto, etc.)
    if (err.name === 'ValidationError') {
        return res.status(400).json({ status: 'error', message: err.message });
    }

    // Cualquier otro error no anticipado: no se filtran detalles internos al cliente
    console.error('Error no controlado:', err);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
};
