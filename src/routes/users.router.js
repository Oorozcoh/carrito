// src/routes/users.router.js
import { Router } from 'express';
import mongoose from 'mongoose';
import { userModel } from '../models/user.model.js';
import { createHash } from '../utils.js';
import { passportCall, authorization } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de este router requieren un JWT válido
router.use(passportCall('current'));

// ---------------------------------------------------------------
// GET /api/users -> Listar todos los usuarios (solo admin)
// ---------------------------------------------------------------
router.get('/', authorization(['admin']), async (req, res) => {
    try {
        const users = await userModel.find().lean();
        return res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al listar usuarios.' });
    }
});

// ---------------------------------------------------------------
// GET /api/users/:uid -> Ver un usuario (dueño de la cuenta o admin)
// ---------------------------------------------------------------
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uid)) {
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido.' });
        }

        if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
            return res.status(403).json({ status: 'error', message: 'No tienes permisos para ver este usuario.' });
        }

        const user = await userModel.findById(uid).lean();
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        delete user.password;
        return res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener el usuario.' });
    }
});

// ---------------------------------------------------------------
// PUT /api/users/:uid -> Actualizar (dueño de la cuenta o admin)
// El email no se permite modificar aquí para no romper la unicidad
// sin re-validar; el password, si viene, se re-hashea.
// El role solo puede cambiarlo un admin.
// ---------------------------------------------------------------
router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uid)) {
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido.' });
        }

        if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
            return res.status(403).json({ status: 'error', message: 'No tienes permisos para modificar este usuario.' });
        }

        const { first_name, last_name, age, password, role } = req.body;
        const updates = {};

        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (age !== undefined) updates.age = age;
        if (password) updates.password = createHash(password);
        if (role !== undefined) {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ status: 'error', message: 'Solo un administrador puede cambiar el rol.' });
            }
            updates.role = role;
        }

        const updatedUser = await userModel.findByIdAndUpdate(uid, updates, { new: true }).lean();
        if (!updatedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        delete updatedUser.password;
        return res.status(200).json({ status: 'success', message: 'Usuario actualizado.', payload: updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al actualizar el usuario.' });
    }
});

// ---------------------------------------------------------------
// DELETE /api/users/:uid -> Eliminar (solo admin)
// ---------------------------------------------------------------
router.delete('/:uid', authorization(['admin']), async (req, res) => {
    try {
        const { uid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uid)) {
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido.' });
        }

        const deletedUser = await userModel.findByIdAndDelete(uid);
        if (!deletedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        return res.status(200).json({ status: 'success', message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al eliminar el usuario.' });
    }
});

export default router;
