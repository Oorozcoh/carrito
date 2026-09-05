// resetUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import dns from 'dns';
import { userModel } from './src/models/user.model.js';
import { cartModel } from './src/models/cart.model.js';

// 1. CARGA DE VARIABLES DE ENTORNO
dotenv.config();

// 2. CONFIGURACIÓN DE DNS PÚBLICOS (Evita fallos de conexión en Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coderhouse_db';

async function crearUsuarioAdmin() {
    try {
        console.log('⏳ Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexión establecida correctamente.');

        const emailAdmin = 'admin@correo.com'.toLowerCase().trim();
        const passwordPlana = '123';

        // Eliminar cualquier registro previo con ese correo para evitar duplicados
        await userModel.deleteMany({ email: emailAdmin });

        // Encriptar contraseña usando Bcrypt con 10 rondas de sal
        const hashedPassword = bcrypt.hashSync(passwordPlana, 10);

        // Cada usuario necesita su propio carrito (referencia obligatoria en el modelo)
        const nuevoCarrito = await cartModel.create({ products: [] });

        // Insertar el nuevo usuario administrador
        const nuevoUsuario = await userModel.create({
            first_name: 'Oscar',
            last_name: 'Orozco',
            email: emailAdmin,
            age: 30,
            password: hashedPassword,
            cart: nuevoCarrito._id,
            role: 'admin'
        });

        console.log('--------------------------------------------------');
        console.log('✅ USUARIO REGISTRADO EXITOSAMENTE EN LA BASE DE DATOS:');
        console.log(`   ID: ${nuevoUsuario._id}`);
        console.log(`   Email: ${nuevoUsuario.email}`);
        console.log(`   Rol: ${nuevoUsuario.role}`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al registrar el usuario:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada.');
    }
}

crearUsuarioAdmin();