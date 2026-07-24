import { Router } from 'express';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';

const cartsRouter = Router();

/**
 * Método DELETE /api/carts/:cid
 * Elimina todos los productos del carrito
 */
cartsRouter.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Vaciamos el arreglo de productos del carrito
        const updatedCart = await cartModel.findByIdAndUpdate(
            cid,
            { $set: { products: [] } },
            { returnDocument: 'after' } // 📌 'after' devuelve el documento ya modificado
        );

        if (!updatedCart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        return res.json({
            status: 'success',
            message: 'Todos los productos han sido eliminados del carrito.',
            payload: updatedCart
        });

    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor: ' + error.message
        });
    }
});

/**
 * Método PUT /api/carts/:cid/products/:pid
*/
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const newQuantity = Number(req.body.quantity);

        if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad debe ser un número mayor o igual a 1.'
            });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito no existe.'
            });
        }

        const productIndex = cart.products.findIndex(item => {
            const idInCart = item.product._id 
                ? item.product._id.toString() 
                : item.product.toString();
            return idInCart === pid;
        });

        if (productIndex !== -1) {
            cart.products[productIndex].quantity = newQuantity;
        } else {
            cart.products.push({
                product: pid,
                quantity: newQuantity
            });
        }

        cart.markModified('products');
        await cart.save();

        return res.json({
            status: 'success',
            message: 'Cantidad actualizada correctamente.',
            payload: cart
        });

    } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor: ' + error.message
        });
    }
});

/**
 * Método POST /api/carts/:cid/products/:pid
 * Agrega un producto al carrito. Si ya existe, suma la cantidad.
 */
cartsRouter.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Si se envía cantidad en el body se usa esa; de lo contrario, se suma 1 por defecto
        const quantityToAdd = Number(req.body.quantity) || 1;

        // 1. Buscar el carrito
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'El carrito solicitado no existe.'
            });
        }

        // 2. Buscar si el producto ya existe en el arreglo
        const productIndex = cart.products.findIndex(item => {
            const idInCart = item.product._id 
                ? item.product._id.toString() 
                : item.product.toString();
            return idInCart === pid;
        });

        if (productIndex !== -1) {
            // EL PRODUCTO YA EXISTE: Sumamos la cantidad
            cart.products[productIndex].quantity += quantityToAdd;
        } else {
            // EL PRODUCTO NO EXISTE: Lo agregamos al arreglo
            cart.products.push({
                product: pid,
                quantity: quantityToAdd
            });
        }

        // 3. Notificar a Mongoose y guardar
        cart.markModified('products');
        await cart.save();

        return res.json({
            status: 'success',
            message: 'Producto agregado/acumulado con éxito.',
            payload: cart
        });

    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor: ' + error.message
        });
    }
});

export default cartsRouter;