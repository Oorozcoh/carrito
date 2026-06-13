import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vinculación de rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT} con ES Modules (ES6) 🚀`);
});