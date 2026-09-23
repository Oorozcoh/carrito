// src/models/user.model.js
import { Schema, model } from 'mongoose';

/**
 * CONSIGNA - Punto 1: Modelo de Usuario
 * Contiene los 7 campos pedidos originalmente: first_name, last_name,
 * email (único), age, password (hash), cart (ref a Carts) y role
 * (default 'user'). A partir de la integración con OAuth (GitHub,
 * Google, Microsoft), `age` y `password` dejan de ser obligatorios A
 * NIVEL DE ESQUEMA: una cuenta creada por un proveedor externo no
 * tiene contraseña propia ni necesariamente entrega la edad. Para el
 * registro LOCAL, esa obligatoriedad se sigue validando explícitamente
 * en la estrategia "register" de Passport (ver passport.config.js) y
 * en userRepository.registerUser() — así que en la práctica un usuario
 * local sigue sin poder registrarse sin age/password, solo que la
 * regla vive en la lógica de negocio, no en el esquema.
 */
const userSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number },
    password: { type: String }, // hash bcrypt; ausente en cuentas de OAuth
    cart: { type: Schema.Types.ObjectId, ref: 'carts' },
    role: { type: String, default: 'user' },
    // 'local' = registro con email/password. Los demás valores indican
    // que la cuenta fue creada (o vinculada) vía ese proveedor externo.
    provider: { type: String, enum: ['local', 'github', 'google', 'microsoft'], default: 'local' },
    providerId: { type: String } // ID de la cuenta en el proveedor externo
}, {
    timestamps: true
});

// Nunca devolver el hash de la contraseña al serializar el usuario (JSON.stringify, res.json, etc.)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

export const userModel = model('users', userSchema);