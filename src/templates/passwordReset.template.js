// src/templates/passwordReset.template.js
//
// Separar el HTML del correo de mail.service.js (que solo debería
// saber CÓMO enviar un correo, no con qué contenido) para que cambiar
// el diseño del email no implique tocar la lógica de Nodemailer.
export const passwordResetTemplate = (resetUrl) => `
    <div style="background:#05060d; padding:40px 20px; font-family:Arial, sans-serif;">
        <div style="max-width:480px; margin:0 auto; background:#0d0f1c; border:1px solid #00f0ff; border-radius:10px; padding:32px; color:#f1f5f9;">
            <h2 style="color:#00f0ff; margin-top:0;">2OH STORE</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Este enlace es válido durante <strong>1 hora</strong>. Si vos no pediste esto, podés ignorar el correo.</p>
            <div style="text-align:center; margin:32px 0;">
                <a href="${resetUrl}"
                   style="background:#00f0ff; color:#05060d; text-decoration:none; font-weight:bold; padding:14px 28px; border-radius:6px; display:inline-block;">
                    Restablecer contraseña
                </a>
            </div>
            <p style="font-size:12px; color:#7d8598;">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color:#00f0ff;">${resetUrl}</a>
            </p>
        </div>
    </div>
`;
