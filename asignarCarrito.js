// asignarCarrito.js
// Uso: node asignarCarrito.js correo@delusuario.com
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { userModel } from './src/models/user.model.js';
import { cartModel } from './src/models/cart.model.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coderhouse_db';

async function asignarCarrito() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Debés indicar el email del usuario. Ejemplo:');
        console.error('   node asignarCarrito.js ana@test.com');
        process.exit(1);
    }

    try {
        console.log(`⏳ Conectando a MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexión establecida.');

        const usuario = await userModel.findOne({ email: email.toLowerCase().trim() });

        if (!usuario) {
            console.error(`❌ No existe ningún usuario con el email: ${email}`);
            return;
        }

        if (usuario.cart) {
            console.log('--------------------------------------------------');
            console.log(`ℹ️  El usuario ${usuario.email} ya tiene un carrito asignado:`);
            console.log(`   Cart ID: ${usuario.cart}`);
            console.log('--------------------------------------------------');
            return;
        }

        // Crear un carrito vacío y asignárselo al usuario
        const nuevoCarrito = await cartModel.create({ products: [] });
        usuario.cart = nuevoCarrito._id;
        await usuario.save();

        console.log('--------------------------------------------------');
        console.log('✅ CARRITO ASIGNADO EXITOSAMENTE:');
        console.log(`   Usuario: ${usuario.email}`);
        console.log(`   Cart ID: ${nuevoCarrito._id}`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al asignar el carrito:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada.');
    }
}

asignarCarrito();
