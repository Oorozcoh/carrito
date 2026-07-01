import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const productsRouter = Router();
const productManager = new ProductManager('./data/products.json');

// GET /api/products/
productsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json({ status: 'success', payload: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /api/products (Listar todo o filtrar por categoría)
productsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        const { category } = req.query;

        if (category) {
            const filteredProducts = products.filter(
                p => p.category && p.category.toLowerCase() === category.toLowerCase()
            );
            
            return res.json({ status: 'success', payload: filteredProducts });
        }

        res.json({ status: 'success', payload: products });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST /api/products/
productsRouter.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const newProduct = await productManager.addProduct(req.body);
        
        const products = await productManager.getProducts();
        req.io.emit('updateProducts', products);

        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// PUT /api/products/:pid
productsRouter.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await productManager.updateProduct(pid, req.body);
        

        if (!updatedProduct) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });        
        
        const products = await productManager.getProducts();
        req.io.emit('updateProducts', products);
        
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// DELETE /api/products/:pid
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const success = await productManager.deleteProduct(pid);
        if (!success) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        
        const products = await productManager.getProducts();
        req.io.emit('updateProducts', products);

        res.json({ status: 'success', message: `Producto con ID ${pid} eliminado` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default productsRouter;