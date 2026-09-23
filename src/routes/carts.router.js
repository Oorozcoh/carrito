// src/routes/carts.router.js
//
// Router "delgado": la lógica vive en src/controllers/cart.controller.js.
//
// CONSIGNA - Middleware de Autorización:
// "Solo el usuario puede agregar productos a su carrito" -> se agregó
// authorization(['user']) en el POST de agregar producto y en el
// endpoint de compra: un admin puede seguir viendo/gestionando
// cualquier carrito (isCartOwner ya lo permite), pero NO puede agregar
// productos ni comprar.
import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { passportCall, authorization, isCartOwner } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const cartsRouter = Router();

// Toda la API de carritos requiere un JWT válido
cartsRouter.use(passportCall('current'));

cartsRouter.post('/', authorization(['admin']), asyncHandler(cartController.create));
cartsRouter.get('/:cid', isCartOwner, asyncHandler(cartController.getById));

// Solo role 'user' (no admin) puede agregar productos y comprar
cartsRouter.post('/:cid/products/:pid', authorization(['user']), isCartOwner, asyncHandler(cartController.addProduct));
cartsRouter.post('/:cid/purchase', authorization(['user']), isCartOwner, asyncHandler(cartController.purchase));

cartsRouter.put('/:cid/products/:pid', isCartOwner, asyncHandler(cartController.updateProductQuantity));
cartsRouter.put('/:cid', isCartOwner, asyncHandler(cartController.updateAllProducts));
cartsRouter.delete('/:cid/products/:pid', isCartOwner, asyncHandler(cartController.removeProduct));
cartsRouter.delete('/:cid', isCartOwner, asyncHandler(cartController.emptyCart));

export default cartsRouter;
