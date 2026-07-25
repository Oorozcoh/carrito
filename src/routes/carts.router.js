import { Router } from 'express';
import mongoose from 'mongoose';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';

const cartsRouter = Router();

// Middleware utilitario para validar el formato ObjectId
const validateObjectId = (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ status: 'error', message: `El ID '${id}' no tiene un formato válido.` });
        return false;
    }
    return true;
};

/**
 * @route   GET /api/carts/:cid
 * @desc    Obtiene un carrito por ID con los datos completos del producto mediante populate
 */
cartsRouter.get('/:cid', async (req, res) => {
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
 * @route   DELETE /api/carts/:cid/products/:pid
 * @desc    Elimina un producto específico del arreglo de productos de un carrito
 */
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // 1. Validar que ambos IDs cumplan con el formato ObjectId de MongoDB
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID del carrito o del producto no tiene un formato válido.'
            });
        }

        // 2. Buscar el carrito en MongoDB
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito especificado no existe en la base de datos.'
            });
        }

        // 3. Filtrar el arreglo para remover el producto que coincida con pid
        const originalLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        // Verificar si el producto realmente estaba en el carrito
        if (cart.products.length === originalLength) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto no se encontró dentro de este carrito.'
            });
        }

        // 4. Guardar los cambios actualizados en la base de datos
        await cart.save();

        // 5. Responder con confirmación y el carrito actualizado
        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito exitosamente.',
            payload: cart
        });

    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al intentar remover el producto: ' + error.message
        });
    }
});

/**
 * @route   DELETE /api/carts/:cid/products/:pid
 * @desc    Elimina un producto específico del arreglo de productos de un carrito
 */
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // 1. Validar que ambos IDs cumplan con el formato ObjectId de MongoDB
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID del carrito o del producto no tiene un formato válido.'
            });
        }

        // 2. Buscar el carrito en MongoDB
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito especificado no existe en la base de datos.'
            });
        }

        // 3. Filtrar el arreglo para remover el producto que coincida con pid
        const originalLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        // Verificar si el producto realmente estaba en el carrito
        if (cart.products.length === originalLength) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto no se encontró dentro de este carrito.'
            });
        }

        // 4. Guardar los cambios actualizados en la base de datos
        await cart.save();

        // 5. Responder con confirmación y el carrito actualizado
        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito exitosamente.',
            payload: cart
        });

    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al intentar remover el producto: ' + error.message
        });
    }
});

/**
 * @route   PUT /api/carts/:cid
 * @desc    Actualiza todo el arreglo de productos del carrito
 */
cartsRouter.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body; // Se espera un arreglo de objetos [{ product: id, quantity: num }]

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
 * @route   PUT /api/carts/:cid/products/:pid
 * @desc    Actualiza únicamente la cantidad de un producto específico en el carrito
 */
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
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
 * @route   DELETE /api/carts/:cid
 * @desc    Vacía completamente el carrito (elimina todos los productos)
 */
cartsRouter.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        if (!validateObjectId(cid, res)) return;

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: 'success', message: 'El carrito ha sido vaciado completamente.', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * @route   POST /api/carts/:cid/products/:pid
 * @desc    Agrega un producto al carrito especificado o incrementa su cantidad si ya existe
 */
cartsRouter.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // 1. Validar que ambos IDs tengan formato válido de MongoDB
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID del carrito o del producto no es válido.'
            });
        }

        // 2. Verificar que el producto exista en la base de datos
        const productExists = await productModel.findById(pid);
        if (!productExists) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto que intentas agregar no existe.'
            });
        }

        // 3. Buscar el carrito en la base de datos
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito especificado no existe.'
            });
        }

        // 4. Verificar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex !== -1) {
            // Si ya existe, incrementamos la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si no existe, agregamos la nueva referencia con cantidad 1
            cart.products.push({ product: pid, quantity: 1 });
        }

        // 5. Guardar los cambios en MongoDB
        await cart.save();

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito con éxito.',
            payload: cart
        });

    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud: ' + error.message
        });
    }
});

/**
 * @route   POST /api/carts
 * @desc    Crea un nuevo carrito de compras en la base de datos
 */
cartsRouter.post('/', async (req, res) => {
    try {
        // 1. Extraer opcionalmente productos enviando body, o inicializar como arreglo vacío
        const { products = [] } = req.body;

        // 2. Crear el nuevo documento de carrito en MongoDB
        const newCart = await cartModel.create({
            products
        });

        // 3. Responder con el carrito recién creado (código HTTP 201 Created)
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente.',
            payload: newCart
        });

    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al intentar crear el carrito: ' + error.message
        });
    }
});

export default cartsRouter;