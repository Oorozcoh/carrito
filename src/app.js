import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns'; // Importar el módulo DNS nativo de Node.js

// 1. Configuración de DNS para resolver problemas de conexión local (evitar ECONNREFUSED), mi antivirus bloquea la conexión.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// 2. Configuración de rutas de archivos para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 3. Importación de enrutadores y modelos
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { productModel } from './models/product.model.js';

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// 4. Conexión a MongoDB Atlas
if (!MONGO_URI) {
    console.error('❌ ERROR: La variable MONGO_URI no está definida en el archivo .env');
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Conectado exitosamente a MongoDB Atlas (carritoDB) ☁️🍃'))
        .catch(error => console.error('Error al conectar a MongoDB Atlas:', error.message));
}

// 5. Middlewares principales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 6. Configuración del motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// 7. Inicio del servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});

// 8. Inicialización de WebSockets con Socket.io
const io = new Server(httpServer);

// Middleware para inyectar io en el objeto req de cada petición HTTP
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 9. Lógica de comunicación en tiempo real vía WebSockets
io.on('connection', (socket) => {
    console.log('⚡ Nuevo cliente conectado a WebSockets');

    // Escuchar el evento de eliminación enviado desde realTimeProducts.handlebars
    socket.on('deleteProduct', async (productId) => {
        try {
            // Eliminar producto de la base de datos
            await productModel.findByIdAndDelete(productId);

            // Consultar la lista actualizada de productos
            const updatedProducts = await productModel.find().lean();

            // Emitir la lista actualizada a todos los clientes conectados
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            console.error('Error al eliminar producto vía WebSockets:', error.message);
        }
    });
});

// 10. Registro de rutas de la aplicación
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// 11. Manejo centralizado de errores
app.use((err, req, res, next) => {
    console.error('🔥 Error en la aplicación:', err.message);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor'
    });
});