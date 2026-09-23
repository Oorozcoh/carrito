// src/models/ticket.model.js
import { Schema, model } from 'mongoose';
import crypto from 'crypto';

/**
 * CONSIGNA - Punto 6: Modelo de Ticket
 * Se genera uno por cada compra procesada (aunque haya sido parcial,
 * ver cart.repository.js -> purchase()). `code` identifica el ticket
 * de forma única, `purchaser` guarda el email del comprador (no una
 * referencia al usuario, para que el ticket sobreviva aunque el
 * usuario cambie de email o sea eliminado más adelante).
 */
const ticketSchema = new Schema({
    code: {
        type: String,
        unique: true,
        default: () => crypto.randomUUID()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
}, {
    versionKey: false
});

export const ticketModel = model('tickets', ticketSchema);
