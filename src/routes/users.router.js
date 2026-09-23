// src/routes/users.router.js
//
// Router "delgado": la lógica vive en src/controllers/user.controller.js.
import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { passportCall, authorization } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const router = Router();

// Todas las rutas de este router requieren un JWT válido
router.use(passportCall('current'));

router.get('/', authorization(['admin']), asyncHandler(userController.getAll));
router.get('/:uid', asyncHandler(userController.getById));
router.put('/:uid', asyncHandler(userController.update));
router.delete('/:uid', authorization(['admin']), asyncHandler(userController.remove));

export default router;
