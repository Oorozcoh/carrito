// src/services/mail.service.js
//
// CONSIGNA - Punto 5: Arquitectura Profesional (técnicas de mailing)
// Encapsula nodemailer detrás de funciones con nombre de negocio, para
// que el resto de la app nunca importe nodemailer directamente ni
// conozca detalles de transporte (host, puerto, credenciales).
import nodemailer from 'nodemailer';
import { passwordResetTemplate } from '../templates/passwordReset.template.js';

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

/**
 * CONSIGNA - Sistema de Recuperación de Contraseña
 * Envía el correo con el botón para restablecer la contraseña.
 * @param {string} toEmail Email del destinatario
 * @param {string} resetUrl Enlace (con el token) que abre el formulario de restablecimiento
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const mailOptions = {
        from: `"2OH Store" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: 'Recuperación de contraseña — 2OH Store',
        html: passwordResetTemplate(resetUrl)
    };

    return transporter.sendMail(mailOptions);
};
