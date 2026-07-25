import { Router } from 'express';
import mongoose from 'mongoose'; // Requerido para validar el formato de ObjectId
import { productModel } from '../models/product.model.js';
import { cartModel } from '../models/cart.model.js';

const viewsRouter = Router();

/**
 * Método GET /products
 * Renderiza el catálogo de productos con paginación
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
 * Método GET /carts/:cid
 * Renderiza la vista del carrito validando el ID y precalculando subtotales
 */
viewsRouter.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // 📌 1. Validar si el ID recibido tiene la estructura correcta de MongoDB
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).send('El ID de carrito proporcionado no tiene un formato válido.');
        }

        // 📌 2. Consultar el carrito en MongoDB con populate
        const cart = await cartModel
            .findById(cid)
            .populate('products.product')
            .lean();

        if (!cart) {
            return res.status(404).send('El carrito solicitado no existe en la base de datos.');
        }

        // 📌 3. Filtrar referencias nulas y precalcular subtotales en JS (sin depender de helpers de Handlebars)
        const formattedProducts = (cart.products || [])
            .filter(item => item.product !== null && item.product !== undefined)
            .map(item => {
                const price = Number(item.product.price) || 0;
                const quantity = Number(item.quantity) || 0;
                return {
                    ...item,
                    subtotal: (price * quantity).toFixed(2) // Propiedad calculada
                };
            });

        // 📌 4. Renderizar enviando todas las variables requeridas
        res.render('cart', {
            cartId: cart._id.toString(),
            products: formattedProducts,
            hasProducts: formattedProducts.length > 0,
            cart: cart
        });

    } catch (error) {
        console.error('Error al cargar la vista del carrito:', error);
        res.status(500).send('Error interno al procesar el carrito: ' + error.message);
    }
});

/**
 * @route   GET /products/:pid
 * @desc    Renderiza la vista de detalle de un producto específico
 */
viewsRouter.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        // Importante: Usamos .lean() para convertir el documento de Mongoose a objeto JS plano para Handlebars
        const product = await productModel.findById(pid).lean();

        if (!product) {
            return res.status(404).send('El producto solicitado no existe.');
        }

        // Renderizamos la plantilla 'productDetail.handlebars' enviando el objeto
        res.render('productDetail', { product });

    } catch (error) {
        console.error('Error al renderizar el detalle del producto:', error);
        res.status(500).send('Error interno al cargar la vista del producto.');
    }
});

export default viewsRouter;