document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.querySelector('.cart-container');
    const cartId = cartContainer ? cartContainer.getAttribute('data-cart-id') : null;

    if (!cartId) {
        console.warn('No se encontró el atributo data-cart-id en el contenedor del carrito.');
        return;
    }

    const quantityInputs = document.querySelectorAll('.input-quantity');

    quantityInputs.forEach(input => {
        input.addEventListener('change', async (e) => {
            const inputElement = e.currentTarget;
            const productId = inputElement.getAttribute('data-product-id');
            const newQuantity = Number(inputElement.value);

            // Validamos que la cantidad no sea menor a 1
            if (isNaN(newQuantity) || newQuantity < 1) {
                alert('La cantidad mínima permitida es 1.');
                inputElement.value = 1;
                return;
            }

            try {
                // Petición PUT para actualizar la cantidad en la base de datos
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('Cantidad actualizada con éxito:', result);
                } else {
                    alert(`No se pudo actualizar la cantidad: ${result.message}`);
                }
            } catch (error) {
                console.error('Error de conexión al actualizar la cantidad:', error);
                alert('Ocurrió un error al comunicarse con el servidor.');
            }
        });
    });

    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const buttonElement = e.currentTarget;
            const productId = buttonElement.getAttribute('data-product-id');

            if (!productId) {
                console.error('El botón no contiene el atributo data-product-id.');
                return;
            }

            try {
                // Petición DELETE para remover el producto de la base de datos
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    // Eliminamos el elemento de la interfaz gráfica
                    const itemElement = document.getElementById(`product-${productId}`);
                    if (itemElement) {
                        itemElement.remove();
                    }

                    // Verificamos si quedaron productos en la lista; si no, mostramos el mensaje de carrito vacío
                    const remainingItems = document.querySelectorAll('.cart-item');
                    if (remainingItems.length === 0) {
                        const cartList = document.querySelector('.cart-list');
                        if (cartList) {
                            cartList.innerHTML = '<p class="empty-cart-msg">El carrito está vacío.</p>';
                        }
                    }

                    alert('Producto eliminado del carrito correctamente.');
                } else {
                    alert(`No se pudo eliminar el producto: ${result.message}`);
                }
            } catch (error) {
                console.error('Error de conexión al eliminar el producto:', error);
                alert('Ocurrió un error al comunicarse con el servidor.');
            }
        });
    });
});