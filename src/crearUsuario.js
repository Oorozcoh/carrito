// crearUsuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { userModel } from './src/models/user.model.js'; // Ajusta la ruta a tu modelo

const MONGO_URI = 'mongodb://127.0.0.1:27017/tu_base_de_datos'; // Ajusta con tu URI de Mongo

async function crearUsuarioPrueba() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const emailPrueba = 'admin@correo.com';
        const passwordPlana = '123456';

        // 1. Eliminar usuario previo si existe
        await userModel.deleteOne({ email: emailPrueba });

        // 2. Encriptar la contraseña con bcrypt (10 rondas de salt)
        const passwordHash = bcrypt.hashSync(passwordPlana, 10);

        // 3. Insertar el usuario en la base de datos
        const nuevoUsuario = await userModel.create({
            first_name: 'Oscar',
            last_name: 'Orozco',
            email: emailPrueba,
            password: passwordHash, // Se guarda la contraseña encriptada ($2b$10$...)
            role: 'admin'
        });

        console.log('✅ Usuario de prueba creado con éxito:');
        console.log(`   Email: ${nuevoUsuario.email}`);
        console.log(`   Password (plano): ${passwordPlana}`);

    } catch (error) {
        console.error('❌ Error al crear el usuario:', error);
    } finally {
        await mongoose.disconnect();
    }
}

crearUsuarioPrueba();