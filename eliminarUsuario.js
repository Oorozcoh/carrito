// eliminarUsuario.js
// Uso: node eliminarUsuario.js correo@delusuario.com
//
// Pide confirmación antes de borrar (escribí "si" cuando te lo pregunte).
// También elimina el carrito asociado a ese usuario, si tiene uno, para
// no dejarlo huérfano en la colección `carts`.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import readline from 'readline';
import { userModel } from './src/models/user.model.js';
import { cartModel } from './src/models/cart.model.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coderhouse_db';

function preguntar(mensaje) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(mensaje, (respuesta) => {
            rl.close();
            resolve(respuesta.trim().toLowerCase());
        });
    });
}

async function eliminarUsuario() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Debés indicar el email del usuario. Ejemplo:');
        console.error('   node eliminarUsuario.js ana@test.com');
        process.exit(1);
    }

    try {
        console.log('⏳ Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexión establecida.');

        const usuario = await userModel.findOne({ email: email.toLowerCase().trim() }).lean();

        if (!usuario) {
            console.error(`❌ No existe ningún usuario con el email: ${email}`);
            return;
        }

        console.log('--------------------------------------------------');
        console.log('Vas a eliminar:');
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Nombre: ${usuario.first_name} ${usuario.last_name || ''}`.trim());
        console.log(`   Rol: ${usuario.role}`);
        console.log(`   Carrito asociado: ${usuario.cart || '(no tiene)'}`);
        console.log('--------------------------------------------------');

        const respuesta = await preguntar('¿Confirmás el borrado? Esta acción no se puede deshacer (si/no): ');

        if (respuesta !== 'si' && respuesta !== 'sí') {
            console.log('🚫 Operación cancelada. No se borró nada.');
            return;
        }

        await userModel.deleteOne({ _id: usuario._id });

        if (usuario.cart) {
            await cartModel.deleteOne({ _id: usuario.cart });
            console.log('🗑️  Carrito asociado eliminado.');
        }

        console.log('--------------------------------------------------');
        console.log(`✅ Usuario ${usuario.email} eliminado correctamente.`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al eliminar el usuario:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada.');
    }
}

eliminarUsuario();
