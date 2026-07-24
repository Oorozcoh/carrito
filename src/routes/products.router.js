import { Router } from 'express';
import { productModel } from '../models/product.model.js';

const productsRouter = Router();

/**
 * Método GET /api/products
 * Obtiene una lista de productos paginada, filtrada y ordenada
 */
productsRouter.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = query;
            }
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await productModel.paginate(filter, options);

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        const prevLink = result.hasPrevPage 
            ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` 
            : null;
        const nextLink = result.hasNextPage 
            ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` 
            : null;

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * Método POST /api/products
 * Crea un nuevo producto en MongoDB
 */
productsRouter.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Todos los campos marcados son obligatorios.'
            });
        }

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

        return res.status(201).json({
            status: 'success',
            message: 'Producto creado correctamente.',
            payload: newProduct
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
});
export default productsRouter;