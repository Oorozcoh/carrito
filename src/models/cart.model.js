import { Schema, model } from 'mongoose';

/**
 * Esquema del Carrito
 * Define la estructura para almacenar productos mediante referencias ObjectId
 */
const cartSchema = new Schema({
    products: [
        {
            _id: false, // Evita generar un _id automático para la sub-propiedad del arreglo
            product: {
                type: Schema.Types.ObjectId,
                ref: 'products', // Debe coincidir exactamente con el nombre de la colección de productos
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'La cantidad mínima es 1']
            }
        }
    ]
}, {
    timestamps: true,
    versionKey: false
});

export const cartModel = model('carts', cartSchema);