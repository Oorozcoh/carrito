// asignarCarrito.js
// Uso: node asignarCarrito.js correo@delusuario.com [edad]
//
// El [edad] al final es opcional: sirve para completar el campo `age`
// en usuarios viejos que se crearon antes de que fuera un campo
// obligatorio del modelo (si no lo indicás y al usuario le falta,
// el script te avisa pero igual le asigna el carrito).
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
    const edadArg = process.argv[3];

    if (!email) {
        console.error('❌ Debés indicar el email del usuario. Ejemplo:');
        console.error('   node asignarCarrito.js ana@test.com');
        process.exit(1);
    }

    try {
        console.log('⏳ Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexión establecida.');

        // findOne + lean() para solo LEER: evita que Mongoose intente
        // validar el documento completo por el simple hecho de tocarlo.
        const usuario = await userModel.findOne({ email: email.toLowerCase().trim() }).lean();

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

        // Crear un carrito vacío
        const nuevoCarrito = await cartModel.create({ products: [] });

        // IMPORTANTE: se usa updateOne() (con $set) y NO usuario.save().
        // .save() dispara la validación de TODO el esquema, incluyendo
        // campos que ya existían en el documento (como `age`), y en
        // usuarios viejos creados antes de que `age` fuera obligatorio
        // esa validación fallaba aunque solo quisiéramos tocar `cart`.
        // updateOne() actualiza únicamente los campos indicados, sin
        // revalidar el resto del documento.
        const camposAActualizar = { cart: nuevoCarrito._id };

        if (edadArg) {
            camposAActualizar.age = Number(edadArg);
        }

        await userModel.updateOne({ _id: usuario._id }, { $set: camposAActualizar });

        console.log('--------------------------------------------------');
        console.log('✅ CARRITO ASIGNADO EXITOSAMENTE:');
        console.log(`   Usuario: ${usuario.email}`);
        console.log(`   Cart ID: ${nuevoCarrito._id}`);

        if (edadArg) {
            console.log(`   Edad actualizada a: ${edadArg}`);
        } else if (!usuario.age) {
            console.log('   ⚠️  Este usuario no tiene "age" cargada en la base.');
            console.log(`   Si querés completarla: node asignarCarrito.js ${email} <edad>`);
        }
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al asignar el carrito:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada.');
    }
}

asignarCarrito();
