const express = require('express');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();
const PORT = 8080;

// Middlewares necesarios para interpretar JSON y datos de formularios de Postman
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Declaración de las rutas principales (Grupos de rutas requeridas)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor para la Entrega 1 escuchando en http://localhost:${PORT}`);
});