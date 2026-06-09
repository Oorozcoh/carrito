const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            // Si el archivo no existe, devolvemos un array vacío
            return [];
        }
    }

    async addProduct(productData) {
        const products = await this.getProducts();
        
        // Autogenerar ID (String o Number de forma incremental segura)
        const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id))) + 1 : 1;

        const newProduct = {
            id: String(newId),
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? productData.status : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: productData.thumbnails || []
        };

        products.push(newProduct);
        await fs.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return newProduct;
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === String(id));
    }

    async updateProduct(id, updateFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === String(id));

        if (index === -1) return null;

        // Extraemos el id para asegurar que NO se actualice ni se elimine
        const { id: _, ...fieldsToUpdate } = updateFields;

        // Combinamos el producto existente con las modificaciones del body
        products[index] = { ...products[index], ...fieldsToUpdate };

        await fs.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === String(id));

        if (index === -1) return false;

        products.splice(index, 1);
        await fs.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return true;
    }
}

module.exports = ProductManager;