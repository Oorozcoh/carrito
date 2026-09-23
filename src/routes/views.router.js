// src/routes/views.router.js
//
// CONSIGNA - Punto 1 (entrega final): Patrón Repository
// Las vistas ya consultan a través de productRepository/cartRepository
// en vez de los modelos de Mongoose directamente.
import { Router } from 'express';
import mongoose from 'mongoose'; // Requerido para validar el formato de ObjectId
import productRepository from '../repositories/product.repository.js';
import cartRepository from '../repositories/cart.repository.js';
import { isAuth, isGuest, isAdmin } from '../middlewares/auth.middleware.js';
import { oauthProviders } from '../config/passport.config.js';

const viewsRouter = Router();

/**
 * Método GET /products
 * Renderiza el catálogo de productos con paginación
 */
viewsRouter.get('/products', isAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const result = await productRepository.getPaginated({}, { page, limit, lean: true });

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
viewsRouter.get('/carts/:cid', isAuth, async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).send('El ID de carrito proporcionado no tiene un formato válido.');
        }

        const cart = await cartRepository.getByIdPopulated(cid);

        if (!cart) {
            return res.status(404).send('El carrito solicitado no existe en la base de datos.');
        }

        const formattedProducts = (cart.products || [])
            .filter(item => item.product !== null && item.product !== undefined)
            .map(item => {
                const price = Number(item.product.price) || 0;
                const quantity = Number(item.quantity) || 0;
                return {
                    ...item,
                    subtotal: (price * quantity).toFixed(2)
                };
            });

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
viewsRouter.get('/products/:pid', isAuth, async (req, res) => {
    try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const product = await productRepository.getById(pid);

        if (!product) {
            return res.status(404).send('El producto solicitado no existe.');
        }

        res.render('productDetail', { product });

    } catch (error) {
        console.error('Error al renderizar el detalle del producto:', error);
        res.status(500).send('Error interno al cargar la vista del producto.');
    }
});

/**
 * @route   GET /realtimeproducts
 * @desc    Renderiza la vista en tiempo real respetando el archivo realTimeProducts.handlebars
 */
viewsRouter.get('/realtimeproducts', isAuth, async (req, res) => {
    try {
        const products = await productRepository.getPaginated({}, { limit: 1000, lean: true });

        res.render('realTimeProducts', {
            products: products.docs,
            style: 'styles.css'
        });

    } catch (error) {
        console.error('Error al cargar la vista en tiempo real:', error);
        res.status(500).send('Error interno al cargar la página.');
    }
});

// Ruta para renderizar la vista de inicio/home
viewsRouter.get('/', isAuth, async (req, res) => {
    try {
        const result = await productRepository.getPaginated({}, { limit: 1000, lean: true });
        res.render('home', { products: result.docs });
    } catch (error) {
        console.error('Error al cargar la vista de inicio:', error);
        res.status(500).send('Error interno al cargar el inicio.');
    }
});

// 📌 Ruta para renderizar el formulario de registro
viewsRouter.get('/register', isGuest, (req, res) => {
    const hasOAuth = oauthProviders.github || oauthProviders.google || oauthProviders.microsoft;
    res.render('register', { oauthProviders, hasOAuth });
});

viewsRouter.get('/login', isGuest, (req, res) => {
    const hasOAuth = oauthProviders.github || oauthProviders.google || oauthProviders.microsoft;
    res.render('login', { oauthProviders, hasOAuth });
});

// CONSIGNA (entrega final) - Punto 3: Sistema de Recuperación de Contraseña
// Formulario para pedir el envío del correo de recuperación
viewsRouter.get('/forgot-password', isGuest, (req, res) => {
    res.render('forgot-password');
});

// Formulario para definir la nueva contraseña, a partir del token que
// llega por query string desde el enlace del correo
viewsRouter.get('/reset-password', isGuest, (req, res) => {
    const { token } = req.query;
    res.render('reset-password', { token });
});

// Perfil del usuario logueado (enlazado desde el navbar)
viewsRouter.get('/profile', isAuth, (req, res) => {
    res.render('profile', { user: req.user });
});

// Panel de administración de productos (solo admin)
viewsRouter.get('/admin/products', isAuth, isAdmin, async (req, res) => {
    try {
        const result = await productRepository.getPaginated({}, { limit: 1000, sort: { title: 1 }, lean: true });
        res.render('admin-products', { products: result.docs });
    } catch (error) {
        console.error('Error al cargar el panel de administración:', error);
        res.status(500).send('Error interno al cargar el panel de administración.');
    }
});

export default viewsRouter;
