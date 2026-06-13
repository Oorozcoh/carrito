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

// GET /api/products/:pid
productsRouter.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST /api/products/
productsRouter.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        
        // Validación de campos obligatorios
        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const newProduct = await productManager.addProduct(req.body);
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
        
        res.json({ status: 'success', message: `Producto con ID ${pid} eliminado correctamente` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default productsRouter;