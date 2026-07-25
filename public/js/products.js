// public/js/products.js (Script en el catálogo de productos)
document.addEventListener('DOMContentLoaded', () => {
    // Intentamos obtener el ID del carrito desde la vista o desde localStorage
    let cartId = document.body.getAttribute('data-cart-id') || localStorage.getItem('cartId');

    const addButtons = document.querySelectorAll('.btn-add-to-cart');

    addButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-product-id');

            if (!cartId) {
                alert('⚠️ Error: No se encontró un ID de carrito válido.');
                return;
            }

            try {
                // Petición POST a la API usando el ID de carrito dinámico
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();

                if (response.ok) {
                    alert('✅ Producto agregado al carrito');
                } else {
                    alert(`⚠️ Error: ${result.message}`);
                }
            } catch (error) {
                console.error('Error de red al agregar producto:', error);
            }
        });
    });
});