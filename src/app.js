// src/app.js

// 1. IMPORTACIÓN DE MÓDULOS
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import { loadUser } from './middlewares/auth.middleware.js';


// 2. CARGA DE VARIABLES DE ENTORNO
dotenv.config();

// 3. CONFIGURACIÓN DNS DE EMERGENCIA PARA MONGO ATLAS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// 4. IMPORTACIÓN DE RUTAS
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';

// 5. CONFIGURACIÓN DE RUTAS ABSOLUTAS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coderhouse_db';

// 6. CONEXIÓN A MONGO DB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado exitosamente a MongoDB.'))
    .catch((err) => console.error('❌ Error de conexión a MongoDB:', err.message));

// 7. MIDDLEWARE DE CABECERAS Y CONTENT SECURITY POLICY (CSP)
// Evita el bloqueo de Chrome DevTools y permite la carga de recursos locales
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' http://localhost:8080 ws://localhost:8080;"
    );
    next();
});

// 8. CONFIGURACIÓN DEL MOTOR DE PLANTILLAS (HANDLEBARS)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// 9. MIDDLEWARES BASE Y ARCHIVOS ESTÁTICOS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apunta a la carpeta public en la raíz del proyecto (fuera de src/)
app.use(express.static(path.join(__dirname, '../public')));

// 9.1 CONFIGURACIÓN DE PASSPORT (estrategias register / login / current)
initializePassport();
app.use(passport.initialize());
app.use(loadUser);

// 10. MIDDLEWARE DE SESIÓN
app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        ttl: 3600
    }),
    secret: process.env.SESSION_SECRET || 'claveSecreta2OHStore',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

// MIDDLEWARE GLOBAL PARA HACER DISPONIBLE LA SESIÓN EN TODAS LAS VISTAS
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "script-src-elem 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' http://localhost:8080 ws://localhost:8080; " +
        "form-action 'self';"
    );
    next();
});

// 11. ENRUTADORES
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/products', productsRouter);

// 12. INICIALIZACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`⚡ Servidor corriendo en http://localhost:${PORT}`);
});

export default app;