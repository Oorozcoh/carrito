document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtenemos el contenedor del carrito para extraer su ID
    const cartContainer = document.querySelector('.cyber-container');
    const cartId = cartContainer ? cartContainer.getAttribute('data-cart-id') : null;

    // 2. Escuchamos los clics en los botones de eliminar
    document.querySelectorAll('.btn-delete-product').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-product-id');

            if (!cartId || !productId) {
                alert('No se pudo obtener el ID del carrito o del producto.');
                return;
            }

            try {
                // 3. Enviamos la petición DELETE a la API de carritos
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // 4. Si la eliminación fue exitosa en el backend, recargamos la página para actualizar la vista
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(`Error al eliminar el producto: ${data.message || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Error de red al intentar eliminar:', error);
                alert('Hubo un problema de conexión al intentar eliminar el producto.');
            }
        });
    });
});