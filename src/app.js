import express from 'express';
import handlebars from 'express-handlebars';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns'; // Importar el módulo DNS nativo de Node.js

// Establecer servidores DNS públicos (Google / Cloudflare) para evitar el bloqueo ECONNREFUSED, ya que mi antivirus los bloquea
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { productModel } from './models/product.model.js';

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Conexión a MongoDB Atlas
if (!MONGO_URI) {
    console.error('❌ ERROR: La variable MONGO_URI no está definida en el archivo .env');
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Conectado exitosamente a MongoDB Atlas (carritoDB) ☁️🍃'))
app.engine('handlebars', handlebars.engine({
    helpers: {
        // Recibe dos valores y retorna la multiplicación formateada
        multiply: (a, b) => {
            const num1 = Number(a) || 0;
            const num2 = Number(b) || 0;
            return (num1 * num2).toFixed(2); // Devuelve el subtotal con 2 decimales
        }
    }
}));}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



// Motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});

const io = new Server(httpServer);

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Manejo centralizado de errores
app.use((err, req, res, next) => {
    console.error('🔥 Error en la aplicación:', err.message);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor'
    });
});