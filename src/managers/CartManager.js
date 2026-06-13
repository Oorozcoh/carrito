import fs from 'fs';
const fsPromises = fs.promises;

class CartManager {
    constructor(filePath) {
        this.path = filePath;
    }

    async getCarts() {
        try {
            const data = await fsPromises.readFile(this.path, 'utf-8');
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
        await fsPromises.writeFile(this.path, JSON.stringify(carts, null, '\t'));
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

        const productIndex = cart.products.findIndex(p => p.product === String(productId));

        if (productIndex !== -1) {

            cart.products[productIndex].quantity += 1;
        } else {

            cart.products.push({
                product: String(productId),
                quantity: 1
            });
        }

        carts[cartIndex] = cart;
        await fsPromises.writeFile(this.path, JSON.stringify(carts, null, '\t'));
        return cart;
    }
}

export default CartManager;