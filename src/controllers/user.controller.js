// src/controllers/user.controller.js
import mongoose from 'mongoose';
import userRepository from '../repositories/user.repository.js';
import { createHash } from '../utils/password.util.js';
import { ApiError } from '../errors/ApiError.js';

const assertValidId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.badRequest('ID de usuario inválido.');
    }
};

/**
 * GET /api/users -> Listar todos los usuarios (solo admin, ver router)
 */
export const getAll = async (req, res) => {
    const users = await userRepository.getAll();
    return res.status(200).json({ status: 'success', payload: users });
};

/**
 * GET /api/users/:uid -> Ver un usuario (dueño de la cuenta o admin)
 */
export const getById = async (req, res) => {
    const { uid } = req.params;
    assertValidId(uid);

    if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
        throw ApiError.forbidden('No tienes permisos para ver este usuario.');
    }

    const user = await userRepository.getById(uid);
    if (!user) {
        throw ApiError.notFound('Usuario no encontrado.');
    }

    return res.status(200).json({ status: 'success', payload: user }); // toJSON() del modelo ya excluye el password
};

/**
 * PUT /api/users/:uid -> Actualizar (dueño de la cuenta o admin)
 * El email no se permite modificar aquí para no romper la unicidad sin
 * re-validar; el password, si viene, se re-hashea. El role solo lo
 * cambia un admin.
 */
export const update = async (req, res) => {
    const { uid } = req.params;
    assertValidId(uid);

    if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
        throw ApiError.forbidden('No tienes permisos para modificar este usuario.');
    }

    const { first_name, last_name, age, password, role } = req.body;
    const updates = {};

    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (age !== undefined) updates.age = age;
    if (password) updates.password = createHash(password);
    if (role !== undefined) {
        if (req.user.role !== 'admin') {
            throw ApiError.forbidden('Solo un administrador puede cambiar el rol.');
        }
        updates.role = role;
    }

    const updatedUser = await userRepository.updateUser(uid, updates);
    if (!updatedUser) {
        throw ApiError.notFound('Usuario no encontrado.');
    }

    return res.status(200).json({ status: 'success', message: 'Usuario actualizado.', payload: updatedUser });
};

/**
 * DELETE /api/users/:uid -> Eliminar (solo admin, ver router)
 */
export const remove = async (req, res) => {
    const { uid } = req.params;
    assertValidId(uid);

    const deletedUser = await userRepository.deleteUser(uid);
    if (!deletedUser) {
        throw ApiError.notFound('Usuario no encontrado.');
    }

    return res.status(200).json({ status: 'success', message: 'Usuario eliminado correctamente.' });
};
