
# API REST con Persistencia en Archivos y Comunicación en Tiempo Real (WebSockets)

Este proyecto consiste en un servidor desarrollado sobre **Node.js** y **Express** enfocado en la gestión de un catálogo de productos y carrito de compras. 

La aplicación utiliza el motor de plantillas **Handlebars** para el renderizado del lado del servidor y se integra con **Socket.io** para ofrecer una experiencia reactiva en tiempo real.

---

# Características Principales e Innovaciones

* **Estándar Moderno:** Configurado con `"type": "module"` en el `package.json` utilizando la sintaxis nativa de `import` y `export`.
* **Persistencia Asíncrona:** El almacenamiento de datos se realiza de forma local y no bloqueante en archivos JSON (`products.json` y `carts.json`) mediante el módulo nativo `fs.promises`.
* **Sincronización HTTP ⇄ WebSockets:** Las operaciones CRUD de mutación de datos (`POST`, `PUT`, `DELETE`) se realizan mediante peticiones HTTP tradicionales (vía Insomnia o Postman). El servidor intercepta estas solicitudes e inyecta la instancia de Sockets para emitir los cambios en tiempo real a todas las vistas del navegador conectadas de forma reactiva.
* **Filtrado Bidireccional Interactivo:** En la vista de tiempo real, el cliente puede interactuar con un menú desplegable (Select). Este componente gatilla eventos asíncronos hacia el servidor, el cual procesa el filtro de categorías y re-inyecta los datos filtrados dinámicamente en el DOM sin recargar la página.

---

# Arquitectura y Estructura del Proyecto

* `src/app.js`: Punto de entrada del servidor. Configura los motores visuales, inicializa el servidor nativo HTTP acoplado a Socket.io e inyecta el middleware global de sockets.
* `src/routes/`: Capa encargada de gestionar los endpoints y capturar parámetros de solicitudes.
  * `Products.router.js`: Enrutador para el catálogo de productos (soporta filtros HTTP por query parameters).
  * `Carts.router.js`: Enrutador para la gestión y adición incremental de productos en carritos.
  * `Views.router.js`: Enrutador encargado de servir y pre-renderizar las plantillas de Handlebars.
* `src/managers/`: Capa de persistencia que interactúa directamente con los archivos del disco duro.
  * `ProductManager.js`: Mánager para el control operacional del catálogo JSON.
  * `CartManager.js`: Mánager para el control de los carritos de compras.
* `src/views/`: Capa de presentación (Plantillas `.handlebars`).
  * `layouts/main.handlebars`: Estructura HTML base global.
  * `home.handlebars`: Catálogo estático tradicional renderizado desde el servidor.
  * `realTimeProducts.handlebars`: Vista interactiva con scripts de escucha a Socket.io y filtrado por select.

---

# Listado Completo de Endpoints y Vistas

# Rutas del Navegador (Vistas Renderizadas)

| Ruta | Motor | Descripción |
| :--- | :--- | :--- |
| **GET** `/` | Handlebars | Muestra la lista estática de todos los productos agregados en el sistema. |
| **GET** `/realtimeproducts` | Handlebars + WS | Catálogo interactivo en tiempo real con menú select para filtrar categorías vía WebSockets de forma bidireccional. |

# Módulo de Productos de la API (`/api/products`)

| Método     | Endpoint | Descripción                                                                                                        | Estado HTTP |
| :--- | :---| :---     | :---                                                                                                               |
| **GET**    | `/`      | Devuelve la lista completa de productos. Soporta el filtrado opcional por Query Parameter (ej. `?category=mouse`). | `200 OK`    |
| **GET**    | `/:pid`  | Busca y devuelve un producto específico según su ID correlativo. | `200 OK` / `404 Not Found`                      |
| **POST**   | `/`      | Crea un nuevo producto validando campos obligatorios. **Dispara actualización en tiempo real vía WebSockets.**     | `201 Created` / `400 Bad Request`                                                                                                                                 |
| **PUT**    | `/:pid`  | Actualiza propiedades de un producto. **Dispara actualización en tiempo real vía WebSockets.**                     | `200 OK` / `404 Not Found`                                                                                                                                       |
| **DELETE** | `/:pid`  | Elimina físicamente un producto mediante su ID. **Dispara actualización en tiempo real vía WebSockets.**           | `200 OK` / `404 Not Found` |

# Módulo de Carritos de la API (`/api/carts`)

| Método   | Endpoint             | Descripción                                                                                              | Estado HTTP |
| :---     | :---                 | :--- | :--- |
| **POST** | `/`                  | Inicializa y crea un nuevo carrito de compras vacío con un ID único. | `201 Created`                     |
| **GET**  | `/:cid`              | Devuelve exclusivamente el arreglo de productos contenidos dentro de ese carrito.                        | `200 OK` / `404 Not Found` |
| **POST** | `/:cid/product/:pid` | Agrega un producto al carrito. Incrementa de uno en uno la cantidad (`quantity`) si el producto existía. | `200 OK` / `404 Not Found` |

---

# COMO PROBAR EL MÓDULO DE PROUCTOS

# Abrir Insomnia, crea una nueva petición (Request) y realizar las siguientes pruebas en orden:

*Crear un producto (POST):*

`Método: POST`

* URL: http://localhost:8080/api/products

* Body (formato JSON): Envía un objeto con los campos obligatorios. ej:
  { "title": "Monitor curvo para juegos serie C275B-FW250G",
	"description": "Sceptre Monitor curvo para juegos de 27 pulgadas 1080p 1500R hasta 250Hz DisplayPort x2 HDMI x2 100% sRGB 1ms altavoces integrados.",
	"code": "MON-001",
	"price": 185,
	"status": true,
	"stock": 3,
	"category": "monitores",
	"thumbnails": []
  }

*Listar todos los products (GET):*

`Método: GET`

* URL: http://localhost:8080/api/products

    **Devolverá un arreglo con todos los productos creados.** 

*Buscar por ID (GET con parámetro):*

`Método: GET`

* URL: http://localhost:8080/api/products/2

    **Devuelve exactamente el producto con ID 2.**

# COMO PROBAR EL MÓDULO DE CARRITO

* Crear un nuevo carrito (POST):

`Método: POST`

* URL: http://localhost:8080/api/carts

   **Al presionar Send, responderá con un carrito vacío y un número de id:**

*Agregar un producto al carrito (POST con parámetros):*

`Método: POST`

* URL: http://localhost:8080/api/carts/1/product/1

   **Al hacer clic en Send, devolverá el carrito actualizado con el formato exacto requerido:**

    * {
    "id": "1",
    "products": [
        {
        "product": "1",
        "quantity": 1
        }
    ]
    }

   **Si se vuelve a presionar Send en la misma URL, la propiedad quantity se incrementa en 1 automáticamente**

*Ver productos de un carrito específico (GET):*

`Método: GET`

* URL: http://localhost:8080/api/carts/1

   **responderá únicamente con el arreglo de productos que pertenecen a ese carrito.**


# Estructura del Proyecto

```
CARRITO
├── data/
│   ├── carts.json                      # Base de datos local de carritos
│   └── products.json                   # Base de datos local de productos
├── src/     
│   ├── managers/     
│   │   ├── CartManager.js              # Lógica de persistencia para carritos
│   │   └── ProductManager.js           # Lógica de persistencia para productos
│   ├── routes/     
│   │   ├── carts.router.js             # Rutas de la API para carritos
│   │   ├── products.router.js          # Rutas de la API para productos
│   │   └── views.router.js             # Vistas estática y dinámica para el navegador
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars         # Plantilla base y estructura HTML global (Layout)
│   │   ├── home.handlebars             # Vista del catálogo estático tradicional
│   │   └── realTimeProducts.handlebars # Vista interactiva reactiva mediante WebSockets
│   └── app.js                          # Punto de entrada del servidor e inicio de Socket.io
├── .gitignore                          # Archivos ignorados en Git (node_modules)
├── package.json                        # Configuración y dependencias del proyecto
└── README.md                           # Documentación del proyecto
```