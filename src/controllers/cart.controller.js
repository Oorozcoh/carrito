// src/controllers/cart.controller.js
import mongoose from 'mongoose';
import cartRepository from '../repositories/cart.repository.js';
import CartDAO from '../dao/cart.dao.js';
import { ApiError } from '../errors/ApiError.js';

// El alta de un carrito "suelto" (sin dueño) es persistencia pura, sin
// reglas de negocio propias — se usa el DAO directamente acá.
const cartDao = new CartDAO();

const assertValidId = (id, label = 'ID') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.badRequest(`El ${label} no tiene un formato válido.`);
    }
};

/**
 * POST /api/carts -> Crea un carrito suelto (solo admin, ver router)
 */
export const create = async (req, res) => {
    const { products = [] } = req.body;
    const newCart = await cartDao.create({ products });
    return res.status(201).json({ status: 'success', message: 'Carrito creado exitosamente.', payload: newCart });
};

/**
 * GET /api/carts/:cid -> Obtiene un carrito populado (dueño o admin, ver router)
 */
export const getById = async (req, res) => {
    const { cid } = req.params;
    assertValidId(cid, 'ID de carrito');

    const cart = await cartRepository.getByIdPopulated(cid);
    if (!cart) {
        throw ApiError.notFound('Carrito no encontrado.');
    }

    return res.json({ status: 'success', payload: cart });
};

/**
 * CONSIGNA - "Solo el usuario puede agregar productos a su carrito"
 * POST /api/carts/:cid/products/:pid (role 'user' + dueño, ver router)
 */
export const addProduct = async (req, res) => {
    const { cid, pid } = req.params;
    assertValidId(cid, 'ID de carrito');
    assertValidId(pid, 'ID de producto');

    const cart = await cartRepository.addProduct(cid, pid);
    return res.json({ status: 'success', message: 'Producto agregado al carrito con éxito.', payload: cart });
};

/**
 * PUT /api/carts/:cid/products/:pid -> Actualiza cantidad (dueño o admin)
 */
export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    assertValidId(cid, 'ID de carrito');
    assertValidId(pid, 'ID de producto');

    if (typeof quantity !== 'number' || quantity < 1) {
        throw ApiError.badRequest('La cantidad debe ser un número mayor a 0.');
    }

    const cart = await cartRepository.updateProductQuantity(cid, pid, quantity);
    return res.json({ status: 'success', message: 'Cantidad actualizada correctamente.', payload: cart });
};

/**
 * PUT /api/carts/:cid -> Reemplaza todo el arreglo de productos (dueño o admin)
 */
export const updateAllProducts = async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    assertValidId(cid, 'ID de carrito');
    if (!Array.isArray(products)) {
        throw ApiError.badRequest("El campo 'products' debe ser un arreglo.");
    }

    const cart = await cartRepository.updateAllProducts(cid, products);
    if (!cart) {
        throw ApiError.notFound('Carrito no encontrado.');
    }

    return res.json({ status: 'success', message: 'Carrito actualizado completamente.', payload: cart });
};

/**
 * DELETE /api/carts/:cid/products/:pid -> Elimina un producto (dueño o admin)
 */
export const removeProduct = async (req, res) => {
    const { cid, pid } = req.params;
    assertValidId(cid, 'ID de carrito');
    assertValidId(pid, 'ID de producto');

    const cart = await cartRepository.removeProduct(cid, pid);
    return res.json({ status: 'success', message: 'Producto eliminado del carrito.', payload: cart });
};

/**
 * DELETE /api/carts/:cid -> Vacía el carrito (dueño o admin)
 */
export const emptyCart = async (req, res) => {
    const { cid } = req.params;
    assertValidId(cid, 'ID de carrito');

    const cart = await cartRepository.emptyCart(cid);
    if (!cart) {
        throw ApiError.notFound('Carrito no encontrado.');
    }

    return res.json({ status: 'success', message: 'Carrito vaciado exitosamente.', payload: cart });
};

/**
 * CONSIGNA - Mejora en la Lógica de Compra
 * POST /api/carts/:cid/purchase (role 'user' + dueño, ver router)
 */
export const purchase = async (req, res) => {
    const { cid } = req.params;
    assertValidId(cid, 'ID de carrito');

    const { ticket, failedProducts } = await cartRepository.purchase(cid, req.user.email);

    if (!ticket) {
        // Caso especial: necesitamos devolver failedProducts junto con el
        // error, y ApiError solo transporta un mensaje — por eso acá se
        // responde directo en vez de lanzar.
        return res.status(400).json({
            status: 'error',
            message: 'No se pudo completar la compra: ningún producto del carrito tenía stock disponible.',
            payload: { failedProducts }
        });
    }

    return res.json({
        status: 'success',
        message: failedProducts.length > 0
            ? 'Compra parcial: algunos productos no tenían stock suficiente y quedaron en tu carrito.'
            : 'Compra realizada con éxito.',
        payload: { ticket, failedProducts }
    });
};
