import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { productModel } from './models/product.model.js';
import { cartModel } from './models/cart.model.js';

// Configurar resolución DNS para evitar bloqueos
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// Lote de productos de prueba
const mockProducts = [
    { title: 'Teclado Mecánico RGB', description: 'Teclado gamer con switches red y retroiluminación neón.', code: 'PROD-001', price: 120, stock: 15, category: 'Periféricos' },
    { title: 'Mouse Cyberpunk 8K', description: 'Mouse óptico ultra preciso de 26000 DPI.', code: 'PROD-002', price: 85, stock: 20, category: 'Periféricos' },
    { title: 'Monitor Curvo 144Hz', description: 'Pantalla OLED de 27 pulgadas 1ms.', code: 'PROD-003', price: 450, stock: 8, category: 'Monitores' },
    { title: 'Procesador Quantum I9', description: '16 núcleos y 24 hilos optimizado.', code: 'PROD-004', price: 580, stock: 5, category: 'Componentes' },
    { title: 'Memoria RAM DDR5 32GB', description: 'Kit 2x16GB a 6000MHz con disipador neón.', code: 'PROD-005', price: 160, stock: 12, category: 'Componentes' },
    { title: 'Tarjeta Gráfica RTX 4080', description: '16GB GDDR6X ideal para renderizado.', code: 'PROD-006', price: 1100, stock: 3, category: 'Componentes' },
    { title: 'SSD NVMe 2TB Gen4', description: 'Unidad de estado sólido de alta velocidad PCIe 4.0.', code: 'PROD-007', price: 210, stock: 18, category: 'Almacenamiento' },
    { title: 'Disco Duro 4TB', description: 'HDD de 7200 RPM para almacenamiento masivo.', code: 'PROD-008', price: 95, stock: 25, category: 'Almacenamiento' },
    { title: 'Fuente de Poder 850W Gold', description: 'Fuente certificada 80 Plus Gold modular.', code: 'PROD-009', price: 175, stock: 10, category: 'Componentes' },
    { title: 'Gabinete Gamer Eclipse', description: 'Gabinete ATX con panel de vidrio templado y RGB.', code: 'PROD-010', price: 140, stock: 9, category: 'Gabinetes' },
    { title: 'Refrigeración Líquida 360mm', description: 'Sistema AIO con iluminación ARGB y bajo ruido.', code: 'PROD-011', price: 220, stock: 7, category: 'Refrigeración' },
    { title: 'Audífonos Gamer Pro X', description: 'Sonido envolvente 7.1 con micrófono desmontable.', code: 'PROD-012', price: 130, stock: 14, category: 'Audio' },
    { title: 'Micrófono Streaming USB', description: 'Micrófono condensador con patrón cardioide.', code: 'PROD-013', price: 110, stock: 11, category: 'Audio' },
    { title: 'Webcam Full HD 1080p', description: 'Cámara con enfoque automático y micrófono integrado.', code: 'PROD-014', price: 75, stock: 16, category: 'Periféricos' },
    { title: 'Monitor UltraWide 34"', description: 'Pantalla IPS 3440x1440 de 165Hz.', code: 'PROD-015', price: 680, stock: 6, category: 'Monitores' },
    { title: 'Placa Madre Z790 Elite', description: 'Motherboard ATX compatible con DDR5 y PCIe 5.0.', code: 'PROD-016', price: 320, stock: 8, category: 'Componentes' },
    { title: 'Router WiFi 6 AX5400', description: 'Router de alta velocidad para gaming y streaming.', code: 'PROD-017', price: 190, stock: 13, category: 'Redes' },
    { title: 'Silla Gamer Titan', description: 'Silla ergonómica con soporte lumbar ajustable.', code: 'PROD-018', price: 290, stock: 5, category: 'Mobiliario' },
    { title: 'Laptop Gaming X15', description: 'Portátil con RTX 4070, 32GB RAM y SSD 1TB.', code: 'PROD-019', price: 1850, stock: 4, category: 'Computadores' },
    { title: 'Tablet Pro 12', description: 'Tablet de 12 pulgadas con lápiz digital incluido.', code: 'PROD-020', price: 650, stock: 9, category: 'Dispositivos' },
    { title: 'UPS 1500VA', description: 'Sistema de respaldo eléctrico con protección contra picos.', code: 'PROD-021', price: 240, stock: 7, category: 'Energía' }
];

const runSeed = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI no está definida en el archivo .env');
        }

        await mongoose.connect(MONGO_URI);
        console.log('☁️🍃 Conectado a MongoDB Atlas (carritoDB) para la carga inicial...');

        await productModel.deleteMany({});
        await cartModel.deleteMany({});
        console.log('🧹 Colecciones limpiadas con éxito en Atlas.');

        const insertedProducts = await productModel.insertMany(mockProducts);
        console.log(`✅ Se insertaron ${insertedProducts.length} productos de prueba.`);

        const initialCart = await cartModel.create({
            products: [
                { product: insertedProducts[0]._id, quantity: 2 },
                { product: insertedProducts[1]._id, quantity: 1 }
            ]
        });

        const totalInDb = await productModel.countDocuments();
        console.log(`\n📦 Confirmación: Hay ${totalInDb} documentos guardados en la colección 'products'.`);

        console.log('\n====================================================');
        console.log(`🛒 CARRITO CREADO EN ATLAS — ID: ${initialCart._id}`);
        console.log('====================================================\n');

    } catch (error) {
        console.error('❌ Error al ejecutar el seed en Atlas:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada.');
    }
};

runSeed();