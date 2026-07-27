const socket = io();

function eliminarProducto(id) {
    socket.emit('deleteProduct', id);
}

socket.on('updateProducts', (products) => {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="neon-cyan">No hay productos registrados en tiempo real.</p>
            </div>
        `;
        return;
    }

    products.forEach(prod => {
        const article = document.createElement('article');
        article.className = 'cyber-card';
        article.id = `prod-${prod._id}`;
        article.innerHTML = `
            <div class="cyber-card-header">
                <span class="cyber-badge">${prod.category || 'GENERAL'}</span>
                <h2 class="product-title">${prod.title}</h2>
            </div>
            
            <div class="cyber-card-body">
                <p class="product-description">${prod.description || ''}</p>
                <div class="product-stats">
                    <div class="stat-box">
                        <span class="stat-label">Precio</span>
                        <span class="stat-value neon-green">$${prod.price}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Stock</span>
                        <span class="stat-value neon-cyan">${prod.stock} u.</span>
                    </div>
                </div>
            </div>

            <div class="cyber-card-footer">
                <button class="cyber-btn-delete" onclick="eliminarProducto('${prod._id}')">
                    <span class="btn-icon">🗑️</span> Eliminar
                </button>
            </div>`;
        container.appendChild(article);
    });
});