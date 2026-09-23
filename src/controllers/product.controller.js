// src/controllers/product.controller.js
import mongoose from 'mongoose';
import productRepository from '../repositories/product.repository.js';
import { ApiError } from '../errors/ApiError.js';

const assertValidId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.badRequest(`El ID '${id}' no es válido.`);
    }
};

/**
 * GET /api/products -> Listado paginado, público
 */
export const getAll = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    let filter = {};
    if (query) {
        filter = (query === 'true' || query === 'false')
            ? { status: query === 'true' }
            : { category: query };
    }

    const options = { page, limit, lean: true };
    if (sort === 'asc' || sort === 'desc') {
        options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    const result = await productRepository.getPaginated(filter, options);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const buildLink = (targetPage) => {
        let link = `${baseUrl}?page=${targetPage}&limit=${limit}`;
        if (sort) link += `&sort=${sort}`;
        if (query) link += `&query=${encodeURIComponent(query)}`;
        return link;
    };

    return res.json({
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
};

/**
 * GET /api/products/:pid -> Consulta de un producto, público
 */
export const getById = async (req, res) => {
    const { pid } = req.params;
    assertValidId(pid);

    const product = await productRepository.getById(pid);
    if (!product) {
        throw ApiError.notFound('El producto solicitado no existe.');
    }

    return res.json({ status: 'success', payload: product });
};

/**
 * POST /api/products -> Crea un producto (solo admin, ver router)
 */
export const create = async (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        throw ApiError.badRequest('Todos los campos obligatorios deben estar presentes.');
    }

    const newProduct = await productRepository.createProduct({
        title,
        description,
        code,
        price: Number(price),
        status: Boolean(status),
        stock: Number(stock),
        category,
        thumbnails
    });

    return res.status(201).json({ status: 'success', message: 'Producto creado exitosamente.', payload: newProduct });
};

/**
 * PUT /api/products/:pid -> Actualiza un producto (solo admin, ver router)
 */
export const update = async (req, res) => {
    const { pid } = req.params;
    assertValidId(pid);

    const updateData = { ...req.body };
    delete updateData._id;

    const updatedProduct = await productRepository.updateProduct(pid, updateData);
    if (!updatedProduct) {
        throw ApiError.notFound('El producto que deseas actualizar no existe.');
    }

    return res.json({ status: 'success', message: 'Producto actualizado exitosamente.', payload: updatedProduct });
};

/**
 * DELETE /api/products/:pid -> Elimina un producto (solo admin, ver router)
 */
export const remove = async (req, res) => {
    const { pid } = req.params;
    assertValidId(pid);

    const deletedProduct = await productRepository.deleteProduct(pid);
    if (!deletedProduct) {
        throw ApiError.notFound('El producto que intentas eliminar no existe.');
    }

    return res.json({ status: 'success', message: 'Producto eliminado exitosamente.', payload: deletedProduct });
};
