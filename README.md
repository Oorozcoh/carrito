# Entrega 1 - Backend Coderhouse: Servidor API REST con Express y Persistencia en Archivos
# Desarrollador:  Oscar Orozco Hurtado

¡Esta es mi primera entrega del curso de Backend! En este proyecto he desarrollado un servidor basado en Node.js y Express que gestiona productos y carritos de compra mediante persistencia local en archivos JSON.

---

## Tecnologías Utilizadas

* **Node.js** (Entorno de ejecución)
* **Express.js** (Framework para el servidor web)
* **FS (File System) Promises** (Manejo de persistencia de archivos de forma asíncrona)
* **Insomnia** (Cliente para pruebas de la API)

---

## Estructura del Proyecto

CARRITO
├── data/
│   ├── carts.json             # Base de datos local de carritos
│   └── products.json          # Base de datos local de productos
├── src/
│   ├── managers/
│   │   ├── CartManager.js     # Lógica de persistencia para carritos
│   │   └── ProductManager.js  # Lógica de persistencia para productos
│   ├── routes/
│   │   ├── carts.router.js    # Rutas de la API para carritos
│   │   └── products.router.js # Rutas de la API para productos
│   └── app.js                 # Punto de entrada del servidor
├── .gitignore                 # Archivos ignorados en Git (node_modules)
├── package.json               # Configuración y dependencias del proyecto
└── README.md                  # Documentación del proyecto