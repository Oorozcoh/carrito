// src/models/user.model.js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: Schema.Types.ObjectId, ref: 'carts' },
    role: { type: String, default: 'user' }
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