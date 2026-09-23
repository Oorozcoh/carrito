// src/dao/product.dao.js
import { productModel } from '../models/product.model.js';

export default class ProductDAO {
    create(data) {
        return productModel.create(data);
    }

    findById(id) {
        return productModel.findById(id);
    }

    findByCode(code) {
        return productModel.findOne({ code });
    }

    paginate(filter, options) {
        return productModel.paginate(filter, options);
    }

    updateById(id, data) {
        return productModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    // Incrementa/decrementa el stock de forma atómica ($inc), evitando
    // condiciones de carrera si dos compras piden el mismo producto
    // al mismo tiempo (a diferencia de leer, restar en JS y guardar).
    incrementStock(id, amount) {
        return productModel.findByIdAndUpdate(id, { $inc: { stock: amount } }, { new: true });
    }

    /**
     * Descuenta `quantity` unidades de stock SOLO SI hay suficiente
     * disponible, en una única operación atómica sobre la base de
     * datos (findOneAndUpdate con filtro de stock >= quantity).
     * Devuelve el producto actualizado si pudo descontar, o `null` si
     * no había stock suficiente — sin necesidad de leer, calcular en
     * JS y volver a escribir (lo que dejaría una ventana de tiempo
     * donde dos compras podrían leer el mismo stock y "pisarse").
     */
    decrementStockIfAvailable(id, quantity) {
        return productModel.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
    }

    deleteById(id) {
        return productModel.findByIdAndDelete(id);
    }
}
