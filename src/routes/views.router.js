import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const viewsRouter = Router();
const productManager = new ProductManager('./data/products.json');

// Vista estática tradicional (home)
viewsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products, title: 'Catálogo Estático' });
    } catch (error) {
        res.status(500).render('home', { products: [], error: error.message });
    }
});

// Vista dinámica interactiva (realTimeProducts)
viewsRouter.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Catálogo en Tiempo Real' });
});

export default viewsRouter;