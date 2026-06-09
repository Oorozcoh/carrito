const { Router } = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');

const router = Router();
const cartManager = new CartManager(path.join(__dirname, '../../data/carts.json'));

// POST /api/carts/ -> Crea un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /api/carts/:cid -> Lista los productos del carrito con id cid
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        
        res.json({ status: 'success', payload: cart.products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST /api/carts/:cid/product/:pid -> Agrega el producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        
        if (!updatedCart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        
        res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;