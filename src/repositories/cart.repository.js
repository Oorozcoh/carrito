// src/repositories/cart.repository.js
import CartDAO from '../dao/cart.dao.js';
import productRepository from './product.repository.js';
import ticketRepository from './ticket.repository.js';
import { ApiError } from '../errors/ApiError.js';

class CartRepository {
    constructor() {
        this.dao = new CartDAO();
    }

    createCart() {
        return this.dao.create({ products: [] });
    }

    getById(id) {
        return this.dao.findById(id);
    }

    getByIdPopulated(id) {
        return this.dao.findByIdPopulated(id);
    }

    /**
     * Agrega un producto al carrito, o le suma +1 si ya estaba.
     * Valida que el producto exista antes de tocar el carrito.
     */
    async addProduct(cartId, productId) {
        const product = await productRepository.getById(productId);
        if (!product) {
            throw ApiError.notFound('El producto que intentás agregar no existe.');
        }

        const cart = await this.dao.findById(cartId);
        if (!cart) {
            throw ApiError.notFound('El carrito especificado no existe.');
        }

        const index = cart.products.findIndex(item => item.product.toString() === productId);
        if (index !== -1) {
            cart.products[index].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        return this.dao.updateProducts(cartId, cart.products);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await this.dao.findById(cartId);
        if (!cart) {
            throw ApiError.notFound('El carrito especificado no existe.');
        }

        const index = cart.products.findIndex(item => item.product.toString() === productId);
        if (index === -1) {
            throw ApiError.notFound('El producto no existe dentro del carrito.');
        }

        cart.products[index].quantity = quantity;
        return this.dao.updateProducts(cartId, cart.products);
    }

    updateAllProducts(cartId, products) {
        return this.dao.updateProducts(cartId, products);
    }

    async removeProduct(cartId, productId) {
        const cart = await this.dao.findById(cartId);
        if (!cart) {
            throw ApiError.notFound('El carrito especificado no existe.');
        }

        const originalLength = cart.products.length;
        const remaining = cart.products.filter(item => item.product.toString() !== productId);

        if (remaining.length === originalLength) {
            throw ApiError.notFound('Producto no encontrado en el carrito.');
        }

        return this.dao.updateProducts(cartId, remaining);
    }

    emptyCart(cartId) {
        return this.dao.updateProducts(cartId, []);
    }

    /**
     * CONSIGNA - Punto 6: Mejora en la Lógica de Compra
     *
     * Procesa la compra de un carrito, producto por producto:
     *   - Si hay stock suficiente, lo descuenta de forma atómica
     *     (reserveStock) y ese producto queda "comprado".
     *   - Si NO hay stock suficiente, el producto se deja en el
     *     carrito tal cual (no se toca su cantidad) para que el
     *     usuario decida qué hacer con él.
     *
     * Al final:
     *   - El carrito queda solo con los productos que NO se pudieron
     *     comprar (compra parcial) o vacío (compra completa).
     *   - Se genera un Ticket únicamente si se compró al menos un
     *     producto (amount = suma de price * quantity de lo comprado,
     *     purchaser = email de quien compra).
     *
     * @returns {{ ticket: object|null, failedProducts: string[] }}
     */
    async purchase(cartId, purchaserEmail) {
        const cart = await this.dao.findByIdPopulated(cartId);
        if (!cart) {
            throw ApiError.notFound('El carrito especificado no existe.');
        }

        const productsNotPurchased = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            const product = item.product; // ya viene populado
            const updatedProduct = await productRepository.reserveStock(product._id, item.quantity);

            if (updatedProduct) {
                // Había stock suficiente y ya se descontó de forma atómica
                totalAmount += product.price * item.quantity;
            } else {
                // No alcanzaba el stock: el producto se queda en el carrito
                productsNotPurchased.push({ product: product._id, quantity: item.quantity });
            }
        }

        // El carrito queda solo con lo que no se pudo comprar
        await this.dao.updateProducts(cartId, productsNotPurchased);

        let ticket = null;
        if (totalAmount > 0) {
            ticket = await ticketRepository.createTicket({
                amount: totalAmount,
                purchaser: purchaserEmail
            });
        }

        return {
            ticket,
            failedProducts: productsNotPurchased.map(item => item.product.toString())
        };
    }
}

export default new CartRepository();
