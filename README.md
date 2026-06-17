### ¿Qué mejoras incluye este nuevo README?
* **Aclaración de ES6:** Se modificó el entorno para que opere bajo `"type": "module"`.
* **Tablas de Endpoints:** Resume el comportamiento de las rutas y los códigos de respuesta HTTP de éxito y error (`404`, `201`, etc.)


# Entrega 1 - Backend Coderhouse: Servidor API REST con Express y Persistencia en Archivos
# Desarrollador:  Oscar Orozco Hurtado

¡Esta es mi primera entrega del curso de Backend! En este proyecto he desarrollado un servidor basado en Node.js y Express que gestiona productos y carritos de compra mediante persistencia local en archivos JSON.

---

## Tecnologías Utilizadas

* **Node.js** (Entorno de ejecución)
* **Express.js** (Framework para el servidor web)
* **Estándar de Módulos:** ES6 Modules (`"type": "module"` habilitado en `package.json`)
* **Persistencia:** Sistema de archivos local por medio de objetos JSON de forma asíncrona mediante el módulo nativo `fs.promises`.
* **Insomnia** (Cliente para pruebas de la API)

---

## 📋 Listado Completo de Endpoints

### Módulo de Productos (`/api/products`)

| Método | Endpoint | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Devuelve la lista completa de productos. Admite el parámetro query `?limit=`. | `200 OK` |
| **GET** | `/:pid` | Busca y devuelve un producto específico según su ID. | `200 OK` / `404 Not Found` |
| **POST** | `/` | Crea un nuevo producto validando sus campos obligatorios en el body. | `201 Created` / `400 Bad Request` |
| **PUT** | `/:pid` | Actualiza los datos provistos de un producto sin alterar su ID original. | `200 OK` / `404 Not Found` |
| **DELETE** | `/:pid` | Elimina físicamente un producto del sistema mediante su ID. | `200 OK` / `404 Not Found` |

### Módulo de Carritos (`/api/carts`)

| Método | Endpoint | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Inicializa y crea un nuevo carrito vacío con un ID único incremental. | `201 Created` |
| **GET** | `/:cid` | Devuelve de manera exclusiva el arreglo de productos contenidos en ese carrito. | `200 OK` / `404 Not Found` |
| **POST** | `/:cid/product/:pid` | Agrega un producto al carrito. Incrementa de uno en uno la cantidad (`quantity`) si el producto ya existe. | `200 OK` / `404 Not Found` |

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