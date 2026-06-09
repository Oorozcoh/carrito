const fs = require('fs').promises;

class CartManager {
    constructor(filePath) {
        this.path = filePath;
    }

    async getCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async createCart() {
        const carts = await this.getCarts();
        const newId = carts.length > 0 ? Math.max(...carts.map(c => Number(c.id))) + 1 : 1;

        const newCart = {
            id: String(newId),
            products: []
        };

        carts.push(newCart);
        await fs.writeFile(this.path, JSON.stringify(carts, null, '\t'));
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(c => c.id === String(id));
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === String(cartId));

        if (cartIndex === -1) return null;

        const cart = carts[cartIndex];
        // Buscamos si el producto ya existe dentro de ese carrito específico
        const productIndex = cart.products.findIndex(p => p.product === String(productId));

        if (productIndex !== -1) {
            // Si ya existe, incrementamos la cantidad de uno en uno
            cart.products[productIndex].quantity += 1;
        } else {
            // Si es nuevo, lo agregamos con formato requerido
            cart.products.push({
                product: String(productId),
                quantity: 1
            });
        }

        carts[cartIndex] = cart;
        await fs.writeFile(this.path, JSON.stringify(carts, null, '\t'));
        return cart;
    }
}

module.exports = CartManager;