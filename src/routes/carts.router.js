import { Router } from 'express';
import mongoose from 'mongoose';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';
import { passportCall, authorization, isCartOwner } from '../middlewares/auth.middleware.js';

const cartsRouter = Router();

// Toda la API de carritos requiere un JWT válido
cartsRouter.use(passportCall('current'));

// Middleware utilitario para validar el formato ObjectId
const validateObjectId = (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ status: 'error', message: `El ID '${id}' no tiene un formato válido.` });
        return false;
    }
    return true;
};

/**
 * @route   POST /api/carts
 * @desc    Crea un nuevo carrito de compras (solo admin: los usuarios ya
 *          reciben el suyo automáticamente al registrarse)
 */
cartsRouter.post('/', authorization(['admin']), async (req, res) => {
    try {
        const { products = [] } = req.body;
        const newCart = await cartModel.create({ products });

        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente.',
            payload: newCart
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   GET /api/carts/:cid
 * @desc    Obtiene un carrito por ID con populate (dueño o admin)
 */
cartsRouter.get('/:cid', isCartOwner, async (req, res) => {
    try {
        const { cid } = req.params;
        if (!validateObjectId(cid, res)) return;

        const cart = await cartModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   POST /api/carts/:cid/products/:pid
 * @desc    Agrega un producto al carrito o incrementa su cantidad (dueño o admin)
 */
cartsRouter.post('/:cid/products/:pid', isCartOwner, async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID del carrito o del producto no es válido.'
            });
        }

        const productExists = await productModel.findById(pid);
        if (!productExists) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto que intentas agregar no existe.'
            });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito especificado no existe.'
            });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito con éxito.',
            payload: cart
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   PUT /api/carts/:cid/products/:pid
 * @desc    Actualiza la cantidad de un producto específico (dueño o admin)
 */
cartsRouter.put('/:cid/products/:pid', isCartOwner, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!validateObjectId(cid, res) || !validateObjectId(pid, res)) return;
        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número mayor a 0.' });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ status: 'error', message: 'El producto no existe dentro del carrito.' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.json({ status: 'success', message: 'Cantidad actualizada correctamente.', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   PUT /api/carts/:cid
 * @desc    Actualiza todo el arreglo de productos (dueño o admin)
 */
cartsRouter.put('/:cid', isCartOwner, async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!validateObjectId(cid, res)) return;
        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: "El campo 'products' debe ser un arreglo." });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        cart.products = products;
        await cart.save();

        res.json({ status: 'success', message: 'Carrito actualizado completamente.', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   DELETE /api/carts/:cid/products/:pid
 * @desc    Elimina un producto del carrito (dueño o admin)
 */
cartsRouter.delete('/:cid/products/:pid', isCartOwner, async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: 'error', message: 'ID no válido.' });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        const originalLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        if (cart.products.length === originalLength) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito.' });
        }

        await cart.save();
        res.json({ status: 'success', message: 'Producto eliminado del carrito.', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   DELETE /api/carts/:cid
 * @desc    Vacía todo el carrito (dueño o admin)
 */
cartsRouter.delete('/:cid', isCartOwner, async (req, res) => {
    try {
        const { cid } = req.params;
        if (!validateObjectId(cid, res)) return;

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: 'success', message: 'Carrito vaciado exitosamente.', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default cartsRouter;
