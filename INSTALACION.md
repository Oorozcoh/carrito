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

## 🛒 Carritos (/api/carts)
    POST /api/carts: Creación de un nuevo carrito.
    GET /api/carts/:cid: Consulta de los productos de un carrito.
    POST /api/carts/:cid/products/:pid: Agregar un producto específico al carrito.
    DELETE /api/carts/:cid/products/:pid: Eliminar un producto específico del carrito.
    DELETE /api/carts/:cid: Vaciar un carrito completo.

## Autor
    Oscar Orozco - Full Stack Web Developer