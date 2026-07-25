import { Router } from 'express';
import { productModel } from '../models/product.model.js';
import mongoose from 'mongoose';

const productsRouter = Router();

/**
 * @route   GET /api/products
 * @desc    Obtiene una lista paginada de productos con opciones de filtro y ordenamiento
 */
productsRouter.get('/', async (req, res) => {
    try {
        // 1. Extracción de parámetros de la URL con valores por defecto
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;

        // 2. Construcción del filtro (query)
        // Permite buscar por categoría o por disponibilidad (status: true / false)
        let filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter = { status: query === 'true' };
            } else {
                filter = { category: query };
            }
        }

        // 3. Configuración de opciones para mongoose-paginate-v2
        const options = {
            page,
            limit,
            lean: true
        };

        // Aplicamos ordenamiento por precio si el parámetro es 'asc' o 'desc'
        if (sort === 'asc' || sort === 'desc') {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        // 4. Ejecución de la consulta paginada
        const result = await productModel.paginate(filter, options);

        // 5. Generación de enlaces de paginación (prevLink y nextLink)
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        
        // Mantener otros parámetros en la URL al paginar
        const buildLink = (targetPage) => {
            let link = `${baseUrl}?page=${targetPage}&limit=${limit}`;
            if (sort) link += `&sort=${sort}`;
            if (query) link += `&query=${encodeURIComponent(query)}`;
            return link;
        };

        // 6. Respuesta estructurada con el formato estandarizado requerido
        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al consultar productos.'
        });
    }
});

/**
 * @route   GET /api/products/:pid
 * @desc    Obtiene un producto por ID con diagnóstico detallado de errores
 */
productsRouter.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // 1. Validar el formato del ObjectId (24 caracteres hexadecimales)
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: `El ID '${pid}' no es válido. Debe tener 24 caracteres hexadecimales.`
            });
        }

        // 2. Verificar que Mongoose esté conectado a la base de datos
        if (mongoose.connection.readyState !== 1) {
            console.error('⚠️ Mongoose no está conectado a MongoDB.');
            return res.status(500).json({
                status: 'error',
                message: 'No hay conexión con la base de datos MongoDB.'
            });
        }

        // 3. Buscar el producto en la base de datos
        const product = await productModel.findById(pid).lean();

        // 4. Si el producto no existe en la colección
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto solicitado no existe en la base de datos.'
            });
        }

        // 5. Respuesta exitosa con el producto
        res.json({
            status: 'success',
            payload: product
        });

    } catch (error) {
        // Muestra en la consola de la terminal el error exacto para depuración
        console.error('❌ Error capturado en GET /api/products/:pid:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud.',
            errorDetail: error.message // Detalle temporal para ayudarte a depurar
        });
    }
});

/**
 * @route   POST /api/products
 * @desc    Crea un nuevo producto en MongoDB
 */
productsRouter.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

        // Validar datos mínimos requeridos
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Todos los campos obligatorios deben estar presentes.'
            });
        }

        // Crear documento en la base de datos
        const newProduct = await productModel.create({
            title,
            description,
            code,
            price: Number(price),
            status: Boolean(status),
            stock: Number(stock),
            category,
            thumbnails
        });

        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente.',
            payload: newProduct
        });

    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al crear el producto: ' + error.message
        });
    }
});

/**
 * @route   PUT /api/products/:pid
 * @desc    Actualiza los campos de un producto existente por su ID
 */
productsRouter.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;

        // 1. Validar si el ID recibido cumple con el formato estándar de ObjectId
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: `El ID '${pid}' no es válido. Debe tener 24 caracteres hexadecimales.`
            });
        }

        // 2. Prevenir la modificación accidental del campo _id de MongoDB
        delete updateData._id;

        // 3. Buscar y actualizar el producto en la base de datos
        // { new: true } le indica a Mongoose que devuelva el producto ya modificado
        const updatedProduct = await productModel.findByIdAndUpdate(pid, updateData, { new: true, runValidators: true });

        // 4. Verificar si el producto existía en la base de datos
        if (!updatedProduct) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto que deseas actualizar no existe en la base de datos.'
            });
        }

        // 5. Responder con el producto actualizado
        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente.',
            payload: updatedProduct
        });

    } catch (error) {
        console.error('Error al actualizar el producto:', error);

        // Controlar error si se intenta asignar un código duplicado a otro producto
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: `El código de producto enviando ya pertenece a otro producto.`
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al actualizar el producto.'
        });
    }
});

/**
 * @route   DELETE /api/products/:pid
 * @desc    Elimina un producto de la base de datos por su ID
 */
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // 1. Validar si el ID recibido cumple con el formato válido de ObjectId
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({
                status: 'error',
                message: `El ID '${pid}' no es válido. Debe tener 24 caracteres hexadecimales.`
            });
        }

        // 2. Buscar y eliminar el producto de MongoDB
        const deletedProduct = await productModel.findByIdAndDelete(pid);

        // 3. Verificar si el producto existía
        if (!deletedProduct) {
            return res.status(404).json({
                status: 'error',
                message: 'El producto que intentas eliminar no existe en la base de datos.'
            });
        }

        // 4. Responder con mensaje de confirmación
        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente de la base de datos.',
            payload: deletedProduct
        });

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al intentar eliminar el producto.'
        });
    }
});

export default productsRouter;