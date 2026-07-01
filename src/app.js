import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


const productManager = new ProductManager('./data/products.json');

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});

const io = new Server(httpServer);

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado vía WebSockets:', socket.id);
    
    const sendProducts = async (categoryFilter = '') => {
        try {
            let products = await productManager.getProducts();
            
            if (categoryFilter && categoryFilter !== 'todos') {
                products = products.filter(
                    p => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()
                );
            }
            
            socket.emit('updateProducts', products);
        } catch (error) {
            console.error("Error al procesar productos en WS:", error.message);
        }
    };

    await sendProducts();

    socket.on('filterCategory', async (selectedCategory) => {
        console.log(`Cliente ${socket.id} solicitó filtrar por: ${selectedCategory}`);
        await sendProducts(selectedCategory);
    });
});