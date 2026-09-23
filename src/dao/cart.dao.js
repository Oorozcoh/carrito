// src/dao/cart.dao.js
import { cartModel } from '../models/cart.model.js';

export default class CartDAO {
    create(data = { products: [] }) {
        return cartModel.create(data);
    }

    findById(id) {
        return cartModel.findById(id);
    }

    findByIdPopulated(id) {
        return cartModel.findById(id).populate('products.product').lean();
    }

    updateProducts(id, products) {
        return cartModel.findByIdAndUpdate(id, { $set: { products } }, { new: true });
    }

    deleteById(id) {
        return cartModel.findByIdAndDelete(id);
    }
}
