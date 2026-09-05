// src/public/js/login.js

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const obj = {};
        formData.forEach((value, key) => obj[key] = value);

        try {
            const response = await fetch('/api/sessions/login', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Redirección manual hacia la vista protegida del catálogo
                window.location.href = result.redirectUrl || '/products';
            } else {
                alert(`Error al iniciar sesión: ${result.message}`);
            }
        } catch (error) {
            console.error('Error en la petición de login:', error);
            alert('Ocurrió un error al intentar conectarse con el servidor.');
        }
    });
}