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
        Ingrese en Postman o Insomnia y seleccione el método GET o en el navegador a http://localhost:8080/api/products?limit=5&page=1&sort=asc
        para confirmar la estructura de la respuesta con status: "success" y los enlaces prevLink / nextLink
    GET /api/products/:pid: Consulta de un producto por su ID.
        Ingrese en Postman o Insomnia y seleccione el método GET o en el navegador a http://localhost:8080/api/products/6a615c4a4cdcf9844984ff9e
        verá que nos devuelve el detalle del producto con el ID enviado
    POST /api/products: Creación de un nuevo producto.
        Ingrese en Postman o Insomnia y seleccione el método POST, vaya a http://localhost:8080/api/products y en el body envíele algo como lo siguiente:
        {
            "title": "Cámara Web Con Enfoque Automático 4k Para Pc - USB",
            "description": "Cámara web 4K para PC con sensor, enfoque automático y cancelación de ruido.",
            "code": "KEY-CYBER-001",
            "price": 98.50,
            "stock": 15,
            "category": "perifericos"
        }
        El servidor responderá con el código 201 Created y los datos del producto insertado.
    PUT /api/products/:pid: Actualización de un producto existente.
        Ingrese en Postman o Insomnia seleccione el método PUT y vaya a /6a615c4a4cdcf9844984ff96 y en el body envíele la siguiente información, luego presione SEND
        {
            "price": 120.98,
            "stock": 20,
            "title": "Teclado Mecánico RGB Cyber Pro Max"
        }
        Deberá recibir un estado 200 OK con la información del producto actualizada reflejada en MongoDB.http://localhost:8080/api/products
    DELETE /api/products/:pid: Eliminación de un producto.
        Ingrese en Postman o Insomnia, seleccione el método DELETE y vaya a http://localhost:8080/api/products/6a615c4a4cdcf9844984ff9e y presione SEND
        Si la operación es exitosa, recibirás la respuesta 200 OK con la confirmación y los datos del producto eliminado.

## Carritos (/api/carts)
    POST /api/carts: Creación de un nuevo carrito.
        En Insomnia seleccione el método POST e ingresa la URL: http://localhost:8080/api/carts y haga clic en SEND
        Recibirá un estado 201 Created con un objeto que contendrá su nuevo _id generado
    GET /api/carts/:cid: Consulta de los productos de un carrito.
        Ingrese a Insomnia, seleccione el método GET y vaya a http://localhost:8080/carts/6a615c4a4cdcf9844984ffab, luego presione SEND
        Si todo está bien le devolverá el listado de los prductos que hay en el carrito, si no hay productos mostrará una pantalla informando que el carrito está vacío
    POST /api/carts/:cid/products/:pid: Agregar un producto específico al carrito.
        Vaya a http://localhost:8080/products, haga clic en el botón "AGREGAR AL CARRITO" en culquiera de los productos, si el producto existe en el carrito sumará la cantidad en 1, de lo contrario adicionará el producto al carrito
        Deberá ver un mensaje diciendo "Producto añadido exitosamente al carrito"
    DELETE /api/carts/:cid/products/:pid: Eliminar un producto específico del carrito.
        En Insomnia seleccione el método DELETE e ingresa la URL: http://localhost:8080/carts/6a615c4a4cdcf9844984ffa7
        Deberá devolver un mesaje con código 200 OK "Success" diciendo "Producto eliminado del carrito exitosamente."
    DELETE /api/carts/:cid: Vaciar un carrito completo.
        Vaya http://localhost:8080/products, haga clic en "MI CARRITO", luego haga clic en el botón "VACIAR CARRITO"
        Desaparecerán todos los productos y aparecerá un mensaje diciendo que el carrito está vacio
    DELETE http://localhost:8080/realtimeproducts:  Elimina un producto en tiempo real y se actualizaza la página al instante.
        Ingrese a http://localhost:8080/realtimeproducts, haga clic en el botón Eliminar de cualquier producto.
        Se eliminará el producto y la página se actualiza al instante

## Autor
    Oscar Orozco - Full Stack Web Developer.