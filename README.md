# 🚀 API E-Commerce & Catalogue System (Cyberpunk Edition)

Sistema backend profesional para la gestión de usuarios, productos y carritos de compras desarrollado con **Node.js**, **Express**, **MongoDB Atlas**, **Mongoose**, **Passport** (autenticación JWT) y el motor de plantillas **Handlebars**.

---

## Tecnologías Utilizadas

* **Node.js** - Entorno de ejecución para JavaScript.
* **Express.js** - Framework web para el servidor y la gestión de rutas.
* **MongoDB Atlas** - Base de datos NoSQL en la nube.
* **Mongoose** - ODM para la definición de esquemas, validaciones y relaciones (`populate`).
* **Mongoose Paginate V2** - Plugin para la paginación eficiente de consultas.
* **Express Handlebars** - Motor de plantillas renderizado desde el servidor (SSR).
* **Passport + Passport-Local + Passport-JWT** - Estrategias de autenticación (registro, login y validación de sesión vía JWT).
* **bcrypt** - Encriptación (`hashSync`) de contraseñas de usuario.
* **jsonwebtoken** - Emisión y verificación de tokens JWT.
* **cookie-parser** - Lectura de la cookie httpOnly donde viaja el JWT.
* **Dotenv** - Gestión de variables de entorno para la configuración de credenciales.

---

## 📁 Estructura del Proyecto

```
CARRITO/
├── data/
│   ├── carts.json                  # Datos locales de carritos
│   └── products.json               # Datos locales de productos
├── node_modules/
├── public/
│   ├── css/
│   │   ├── cyberpunk.css           # Sistema de diseño neón (glass cards, badges)
│   │   └── styles.css               # Tipografías, paleta y estilos base globales
│   └── js/
│       ├── realtime.js             # Productos en tiempo real (websockets) — en uso
│       ├── cart.js                 # ⚠️ No referenciado: cart.handlebars usa <script> inline
│       ├── login.js                # ⚠️ No referenciado: login.handlebars usa <script> inline
│       └── products.js             # ⚠️ No referenciado: products.handlebars usa <script> inline
├── src/
│   ├── config/
│   │   └── passport.config.js      # Estrategias register / login / current
│   ├── managers/
│   │   ├── CartManager.js          # Gestor de persistencia/operaciones de carritos
│   │   └── ProductManager.js       # Gestor de persistencia/operaciones de productos
│   ├── middlewares/
│   │   └── auth.middleware.js      # loadUser, isAuth, isGuest, isAdmin, passportCall, authorization, isCartOwner
│   ├── models/
│   │   ├── cart.model.js           # Esquema Mongoose para el carrito
│   │   ├── product.model.js        # Esquema Mongoose para productos + paginación
│   │   └── user.model.js           # Esquema Mongoose para usuarios (auth)
│   ├── routes/
│   │   ├── carts.router.js         # Endpoints API REST (/api/carts) — protegidos por JWT
│   │   ├── products.router.js      # Endpoints API REST (/api/products) — escritura solo admin
│   │   ├── sessions.router.js      # Endpoints de auth (/api/sessions) — register/login/current/logout
│   │   ├── users.router.js         # CRUD de usuarios (/api/users) — protegido por JWT + roles
│   │   └── views.router.js         # Rutas para el renderizado de plantillas Handlebars
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars     # Layout principal de la aplicación
│   │   ├── partials/
│   │   │   └── navbar.handlebars   # Navbar dinámico (login/registro, perfil/logout, link Admin si aplica)
│   │   ├── admin-products.handlebars # Panel CRUD visual de productos (solo admin)
│   │   ├── cart.handlebars         # Vista visual del carrito
│   │   ├── error.handlebars        # Vista para manejo de errores
│   │   ├── home.handlebars         # Vista de inicio (protegida, "terminal SSR")
│   │   ├── login.handlebars        # Formulario de login (protegida por isGuest)
│   │   ├── products.handlebars     # Vista del catálogo paginado (protegida, requiere login)
│   │   ├── profile.handlebars      # Perfil del usuario logueado
│   │   ├── register.handlebars     # Formulario de registro (protegida por isGuest)
│   │   └── realTimeProducts.handlebars # Vista de productos en tiempo real
│   ├── app.js                      # Punto de entrada y servidor Express
│   ├── seed.js                     # Script para poblar la colección de productos con datos de ejemplo
│   └── utils.js                    # createHash, isValidPassword, generateToken, cookieExtractor
├── .env                            # Variables de entorno (privadas, no se sube a git)
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore                      # Archivos excluidos de control de versiones
├── asignarCarrito.js                # Script para asignar un carrito a un usuario existente que no tenga
├── resetUser.js                    # Script para (re)crear un usuario admin de prueba
├── package-lock.json
├── package.json
└── README.md                       # Documentación principal
```

---

## Instalación y Ejecución

1. Clonar el repositorio e instalar dependencias:

    ```bash
    npm install
    ```

2. Configurar las variables de entorno — crea un archivo `.env` en la raíz tomando como guía `.env.example`:

    ```
    PORT=8080
    MONGO_URI=mongodb+srv://<usuario>:<password>@cluster-backend-db.kc7apkb.mongodb.net/carritoDB?retryWrites=true&w=majority
    JWT_SECRET=una-cadena-larga-y-aleatoria-que-solo-tú-conozcas
    ```

    * `JWT_SECRET` es la clave con la que se firman y validan los tokens de sesión. Nunca la subas a un repositorio público (por eso `.env` está en `.gitignore`). Podés generar una rápido con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
    * Si tu contraseña de MongoDB Atlas tiene caracteres especiales (`@ : / ? # % [ ]` o espacios), tenés que codificarlos (URL-encode) dentro de la `MONGO_URI` o vas a obtener `MongoParseError: Invalid connection string`. Ejemplo: `@` se escribe como `%40`.

3. Levantar el servidor:

    ```bash
    npm run dev
    ```

4. (Opcional) Crear un usuario administrador de prueba directamente en la base de datos:

    ```bash
    node resetUser.js
    ```

5. (Opcional) Poblar el catálogo con productos de ejemplo:

    ```bash
    node src/seed.js
    ```

---

## Acceso a la aplicación (vistas)

Toda la navegación del catálogo requiere estar logueado — si no hay una sesión válida, se redirige automáticamente a `/login`.

* Registro: `http://localhost:8080/register`
* Login: `http://localhost:8080/login`
* Inicio (catálogo, terminal SSR): `http://localhost:8080/`
* Catálogo paginado: `http://localhost:8080/products`
* Vista del carrito: `http://localhost:8080/carts/:cid`
* Perfil / Cerrar sesión: `http://localhost:8080/profile`
* Panel de administración de productos (solo `role: 'admin'`): `http://localhost:8080/admin/products`

---

## Autenticación y Autorización

### Modelo de Usuario (`User`)

| Campo | Tipo | Notas |
|---|---|---|
| `first_name` | String | Obligatorio |
| `last_name` | String | Opcional |
| `email` | String | Obligatorio, único |
| `age` | Number | Obligatorio |
| `password` | String | Hasheado con `bcrypt.hashSync`, nunca se devuelve en las respuestas |
| `cart` | ObjectId | Referencia a `carts`, se crea automáticamente al registrarse |
| `role` | String | `'user'` por defecto |

### Estrategias de Passport

* **`register`** (passport-local): valida email único, hashea el password y crea el carrito propio del usuario.
* **`login`** (passport-local): valida las credenciales contra la base de datos.
* **`current`** (passport-jwt): valida el JWT (leído desde la cookie httpOnly `coderCookieToken` o desde un header `Authorization: Bearer <token>`) y reconsulta al usuario en la base de datos.

### Endpoints de sesión (`/api/sessions`)

* `POST /api/sessions/register` — crea un usuario nuevo.

    ```json
    {
        "first_name": "Ana",
        "last_name": "Gómez",
        "email": "ana@test.com",
        "age": 28,
        "password": "123456"
    }
    ```

* `POST /api/sessions/login` — autentica y devuelve el JWT como cookie httpOnly.

    ```json
    { "email": "ana@test.com", "password": "123456" }
    ```

* `GET /api/sessions/current` — requiere estar logueado. Devuelve los datos del usuario asociado al JWT. Si el token falta o es inválido, responde `401` con un mensaje de Passport.

* `GET /api/sessions/logout` — limpia la cookie de sesión.

### CRUD de usuarios (`/api/users`)

Todas las rutas requieren JWT válido.

| Método | Ruta | Quién puede |
|---|---|---|
| GET | `/api/users` | Solo `admin` |
| GET | `/api/users/:uid` | El dueño de la cuenta o `admin` |
| PUT | `/api/users/:uid` | El dueño de la cuenta o `admin` (el `role` solo lo cambia un `admin`) |
| DELETE | `/api/users/:uid` | Solo `admin` |

---

## Endpoints de la API REST

> Todas las rutas de `/api/carts` y las escrituras (`POST`/`PUT`/`DELETE`) de `/api/products` requieren un JWT válido (cookie de sesión o header `Authorization: Bearer <token>`). Probando desde Postman/Insomnia sin haber hecho login antes, vas a recibir `401 No autorizado`.

### Productos (`/api/products`)

* `GET /api/products` — Listado paginado, público (no requiere login).

    `http://localhost:8080/api/products?limit=5&page=1&sort=asc`

* `GET /api/products/:pid` — Consulta de un producto por su ID. Público.

* `POST /api/products` — Creación de un nuevo producto. **Requiere rol `admin`.**

    ```json
    {
        "title": "Cámara Web Con Enfoque Automático 4k Para Pc - USB",
        "description": "Cámara web 4K para PC con sensor, enfoque automático y cancelación de ruido.",
        "code": "KEY-CYBER-001",
        "price": 98.50,
        "stock": 15,
        "category": "perifericos"
    }
    ```

* `PUT /api/products/:pid` — Actualización de un producto existente. **Requiere rol `admin`.**

* `DELETE /api/products/:pid` — Eliminación de un producto. **Requiere rol `admin`.**

### Carritos (`/api/carts`)

* `POST /api/carts` — Creación de un nuevo carrito. **Requiere rol `admin`** (los usuarios normales ya reciben el suyo automáticamente al registrarse).

* `GET /api/carts/:cid` — Consulta de los productos de un carrito. **Solo el dueño del carrito o un `admin`.**

* `POST /api/carts/:cid/products/:pid` — Agregar un producto al carrito (o sumar +1 si ya está). **Solo el dueño del carrito o un `admin`.** Desde el catálogo (`/products`), esto sucede automáticamente al hacer clic en "AGREGAR AL CARRITO".

* `PUT /api/carts/:cid/products/:pid` — Actualiza la cantidad de un producto puntual. **Solo el dueño o un `admin`.**

* `PUT /api/carts/:cid` — Reemplaza todo el arreglo de productos del carrito. **Solo el dueño o un `admin`.**

* `DELETE /api/carts/:cid/products/:pid` — Elimina un producto específico del carrito. **Solo el dueño o un `admin`.**

* `DELETE /api/carts/:cid` — Vacía el carrito completo. **Solo el dueño o un `admin`.**

* `DELETE http://localhost:8080/realtimeproducts` — Elimina un producto en tiempo real (websockets) y la página se actualiza al instante.

---

## Panel de administración de productos

Disponible en `/admin/products`, únicamente para usuarios con `role: 'admin'` (cualquier otro usuario que intente entrar es redirigido a `/products`; el link "⚙️ Admin" del navbar tampoco se muestra si no sos admin).

Permite, sin usar Postman/Insomnia:

* **Crear** un producto nuevo desde un formulario.
* **Editar** uno existente (el botón "Editar" precarga el formulario con sus datos).
* **Eliminar** un producto (pide confirmación antes de borrar).

Por debajo usa exactamente los mismos endpoints de `POST/PUT/DELETE /api/products` ya protegidos por `authorization(['admin'])` — el panel es la interfaz cómoda, no un camino alternativo sin control de permisos.

---

## Scripts de utilidad

| Script | Uso | Qué hace |
|---|---|---|
| `resetUser.js` | `node resetUser.js` | (Re)crea un usuario `admin` de prueba, con su carrito asignado. |
| `asignarCarrito.js` | `node asignarCarrito.js correo@usuario.com` | Le crea y asigna un carrito a un usuario existente que no tenga (por ejemplo, uno creado antes de que el registro generara el carrito automáticamente). Si ya tiene uno, solo te informa cuál es. |
| `src/seed.js` | `node src/seed.js` | Puebla la colección `products` con datos de ejemplo. |

---

## Notas de seguridad

* Las contraseñas nunca se guardan ni se devuelven en texto plano — se hashean con `bcrypt.hashSync` y el modelo `User` excluye el campo `password` de cualquier respuesta JSON.
* El JWT viaja en una cookie `httpOnly` (no accesible desde JavaScript del navegador), mitigando robo de token vía XSS.
* `.env` está excluido de git vía `.gitignore` — nunca subas tus credenciales reales al repositorio. Usá `.env.example` como plantilla.
* El servidor ya no imprime la `MONGO_URI` completa en consola al conectar (antes exponía usuario y contraseña en cada arranque).

---

## Autor
Oscar Orozco - Full Stack Web Developer.
