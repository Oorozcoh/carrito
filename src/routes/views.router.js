import { Router } from 'express';
import { productModel } from '../models/product.model.js';
import { cartModel } from '../models/cart.model.js';

const viewsRouter = Router();

/**
 * Método GET /products
 * Renderiza la vista principal del catálogo de productos con paginación
 */
viewsRouter.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const result = await productModel.paginate({}, { page, limit, lean: true });

        res.render('products', {
            products: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            limit: limit
        });

    } catch (error) {
        console.error('Error al cargar la vista de productos:', error);
        res.status(500).send('Error interno al cargar el catálogo de productos.');
    }
});

/**
 * Métoco GET /carts/:cid
 * Renderiza la vista visual del carrito por su ID
 */
viewsRouter.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).send('El carrito no existe.');
        }

        res.render('cart', { cart });

    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        res.status(500).send('Error al cargar la vista del carrito.');
    }
});

export default viewsRouter;