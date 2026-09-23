// src/repositories/product.repository.js
import ProductDAO from '../dao/product.dao.js';
import { ApiError } from '../errors/ApiError.js';

class ProductRepository {
    constructor() {
        this.dao = new ProductDAO();
    }

    getPaginated(filter, options) {
        return this.dao.paginate(filter, options);
    }

    getById(id) {
        return this.dao.findById(id);
    }

    async createProduct(data) {
        const exists = await this.dao.findByCode(data.code);
        if (exists) {
            throw ApiError.conflict(`Ya existe un producto con el código '${data.code}'.`);
        }
        return this.dao.create(data);
    }

    updateProduct(id, data) {
        return this.dao.updateById(id, data);
    }

    deleteProduct(id) {
        return this.dao.deleteById(id);
    }

    /**
     * Descuenta stock de forma atómica solo si hay suficiente
     * disponible. Devuelve el producto actualizado, o null si no
     * alcanzaba el stock. Usada por cart.repository.js -> purchase().
     */
    reserveStock(id, quantity) {
        return this.dao.decrementStockIfAvailable(id, quantity);
    }
}

export default new ProductRepository();
