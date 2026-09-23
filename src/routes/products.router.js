// src/routes/products.router.js
//
// Router "delgado": la lógica vive en src/controllers/product.controller.js.
// CONSIGNA - Middleware de Autorización: solo admin crea/actualiza/elimina.
import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { passportCall, authorization } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const productsRouter = Router();

productsRouter.get('/', asyncHandler(productController.getAll));
productsRouter.get('/:pid', asyncHandler(productController.getById));

productsRouter.post('/', passportCall('current'), authorization(['admin']), asyncHandler(productController.create));
productsRouter.put('/:pid', passportCall('current'), authorization(['admin']), asyncHandler(productController.update));
productsRouter.delete('/:pid', passportCall('current'), authorization(['admin']), asyncHandler(productController.remove));

export default productsRouter;
