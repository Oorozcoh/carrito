# 🚀 API E-Commerce & Catalogue System (Cyberpunk Edition)

Sistema backend profesional para la gestión de productos y carritos de compras desarrollado con **Node.js**, **Express**, **MongoDB Atlas**, **Mongoose** y el motor de plantillas **Handlebars**.

---

## Tecnologías Utilizadas

* **Node.js** - Entorno de ejecución para JavaScript.
* **Express.js** - Framework web para el servidor y la gestión de rutas.
* **MongoDB Atlas** - Base de datos NoSQL en la nube.
* **Mongoose** - ODM para la definición de esquemas, validaciones y relaciones (`populate`).
* **Mongoose Paginate V2** - Plugin para la paginación eficiente de consultas.
* **Express Handlebars** - Motor de plantillas renderizado desde el servidor (SSR).
* **Dotenv** - Gestión de variables de entorno para la configuración de credenciales.

---

## 📁 Estructura del Proyecto

```
CARRITO/
├── data/
│   ├── carts.json              # Datos locales de carritos
│   └── products.json           # Datos locales de productos
├── node_modules/
├── public/
│   └── js/
│       └── cart.js             # Lógica del cliente para el carrito
├── src/
│   ├── managers/
│   │   ├── CartManager.js      # Gestor de persisntencia/operaciones de carritos
│   │   └── ProductManager.js   # Gestor de persistencia/operaciones de productos
│   ├── models/
│   │   ├── cart.model.js       # Esquema Mongoose para el carrito
│   │   └── product.model.js    # Esquema Mongoose para productos + paginación
│   ├── routes/
│   │   ├── carts.router.js     # Endpoints API REST (/api/carts)
│   │   ├── products.router.js  # Endpoints API REST (/api/products)
│   │   └── views.router.js     # Rutas para el renderizado de plantillas Handlebars
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars # Layout principal de la aplicación
│   │   ├── cart.handlebars     # Vista visual del carrito
│   │   ├── error.handlebars    # Vista para manejo de errores
│   │   ├── home.handlebars     # Vista de inicio
│   │   ├── products.handlebars # Vista del catálogo paginado
│   │   └── realTimeProducts.handlebars # Vista de productos en tiempo real
│   ├── app.js                  # Punto de entrada y servidor Express
│   └── seed.js                 # Script para sembrado/poblado inicial de datos
├── .env                        # Variables de entorno (privadas)
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Archivos excluidos de control de versiones
├── Entrega-Final.md            # Notas y requerimientos de la entrega final
├── package-lock.json
├── package.json
└── README.md                   # Documentación principal
```

## Instalación y Ejecución
Clonar el repositorio e instalar dependencias:

## Configurar las variables de entorno:
    Crea un archivo .env en la raíz tomando como guía .env.example:

    PORT=8080
    MONGO_URI=mongodb+srv://<usuario>:<password>@cluster-backend-db.kc7apkb.mongodb.net/carritoDB?retryWrites=true&w=majority

## Acceder a la aplicación:

    Catálogo de Productos: http://localhost:8080/products
    Vista del Carrito: http://localhost:8080/carts/:cid

## Endpoints de la API REST
## Productos (/api/products)
    GET /api/products: Listado paginado de productos.
    GET /api/products/:pid: Consulta de un producto por su ID.
    POST /api/products: Creación de un nuevo producto.
    PUT /api/products/:pid: Actualización de un producto existente.
    DELETE /api/products/:pid: Eliminación de un producto.

## Carritos (/api/carts)
    POST /api/carts: Creación de un nuevo carrito.
    GET /api/carts/:cid: Consulta de los productos de un carrito.
    POST /api/carts/:cid/products/:pid: Agregar un producto específico al carrito.
    DELETE /api/carts/:cid/products/:pid: Eliminar un producto específico del carrito.
    DELETE /api/carts/:cid: Vaciar un carrito completo.

## Autor
    Oscar Orozco - Full Stack Web Developer