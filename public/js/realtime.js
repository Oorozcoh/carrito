// Inicializamos la conexión WebSocket con el servidor
const socket = io();

// Función global para solicitar la eliminación de un producto vía WebSockets
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto en tiempo real?')) {
        socket.emit('deleteProduct', productId);
    }
}

// Escuchamos el evento de actualización de lista de productos que envía el servidor
socket.on('updateProducts', (products) => {
    const productsContainer = document.getElementById('products-list');
    
    // Limpiamos el contenedor actual
    productsContainer.innerHTML = '';

    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="neon-text-cyan">No hay productos disponibles en este momento.</p>';
        return;
    }

    // Renderizamos los productos recibidos en tiempo real
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'cyber-card';
        card.id = `product-${prod._id}`;
        card.innerHTML = `
            <div class="cyber-card-body">
                <h3 class="product-title">${prod.title}</h3>
                <p class="product-detail">Categoría: <span class="neon-text-cyan">${prod.category}</span></p>
                <p class="product-detail">Precio: <span class="neon-text-green">$${prod.price}</span></p>
                <p class="product-detail">Stock: <span class="neon-text-pink">${prod.stock}</span></p>
            </div>
            <div class="cyber-card-actions">
                <button class="cyber-btn cyber-btn-danger btn-delete" onclick="deleteProduct('${prod._id}')">
                    🗑️ ELIMINAR
                </button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
});