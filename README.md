# 🚀 API E-Commerce & Catalogue System (Cyberpunk Edition)

Sistema backend profesional para la gestión de usuarios, productos, carritos y compras, desarrollado con **Node.js**, **Express**, **MongoDB Atlas**, **Mongoose**, **Passport** (autenticación JWT), **Nodemailer** y el motor de plantillas **Handlebars**.

Arquitectura organizada en capas (**Router → Repository → DAO → Modelo**), con **DTOs** para no exponer datos sensibles y un sistema de recuperación de contraseña por correo.

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
* **Nodemailer** - Envío del correo de recuperación de contraseña.
* **Dotenv** - Gestión de variables de entorno para la configuración de credenciales.

---

## 🏗️ Arquitectura por capas

```
Router  →  Controller  →  Repository  →  DAO  →  Modelo (Mongoose)
(HTTP)      (request/       (negocio)      (persistencia)
             response)
```

* **Router** (`src/routes/`): solo define URL + middleware + qué controller la atiende. No contiene lógica propia.
* **Controller** (`src/controllers/`): recibe `(req, res, next)`, llama al Repository que corresponda y arma la respuesta HTTP. No sabe nada de Mongoose.
* **Repository** (`src/repositories/`): la lógica de negocio (validar un email único, calcular el total de una compra, descontar stock, etc.), apoyándose en uno o más DAO.
* **DAO** (`src/dao/`): la única capa que le habla directamente a Mongoose. No tiene lógica de negocio, solo lee/escribe documentos.
* **DTO** (`src/dto/`): moldea qué datos salen hacia el cliente en las respuestas sensibles, como `/api/sessions/current`.
* **Errors** (`src/errors/`): `ApiError` (error tipado con su status HTTP) + un único `errorHandler` middleware al final de `app.js` que traduce cualquier error a una respuesta JSON consistente — los controllers no repiten `try/catch` con `res.status()`, simplemente lanzan (`throw ApiError.notFound(...)`) y `asyncHandler` (`src/utils/asyncHandler.util.js`) se encarga de mandarlo a `next()`.
* **Services** (`src/services/`): integraciones externas encapsuladas (por ahora, el envío de mails).
* **Templates** (`src/templates/`): contenido de los correos, separado de la lógica de envío (`mail.service.js`).

---

## 📁 Estructura del Proyecto

```
CARRITO/
├── node_modules/
├── public/
│   ├── css/
│   │   ├── cyberpunk.css           # Sistema de diseño neón (glass cards, badges)
│   │   └── styles.css               # Tipografías, paleta y estilos base globales
│   └── js/
│       └── realtime.js             # Productos en tiempo real (websockets)
├── src/
│   ├── config/
│   │   └── passport.config.js      # Estrategias register / login / current (usan userRepository)
│   ├── controllers/
│   │   ├── session.controller.js   # register, login, current (DTO), logout, forgot/reset password
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   └── cart.controller.js      # Incluye purchase (finalizar compra)
│   ├── dao/
│   │   ├── user.dao.js
│   │   ├── product.dao.js
│   │   ├── cart.dao.js
│   │   ├── ticket.dao.js
│   │   └── passwordToken.dao.js
│   ├── dto/
│   │   └── user.dto.js             # CurrentUserDTO (usado en GET /api/sessions/current)
│   ├── errors/
│   │   ├── ApiError.js             # Error tipado con su status HTTP (badRequest, notFound, etc.)
│   │   └── errorHandler.middleware.js # Único traductor de errores -> respuesta JSON
│   ├── managers/
│   │   └── README.md               # Placeholder: superseded por dao/ + repositories/ (ver el archivo)
│   ├── middlewares/
│   │   └── auth.middleware.js      # loadUser, isAuth, isGuest, isAdmin, passportCall, authorization, isCartOwner
│   ├── models/
│   │   ├── cart.model.js
│   │   ├── product.model.js
│   │   ├── user.model.js
│   │   ├── ticket.model.js         # Modelo de tickets de compra
│   │   └── passwordToken.model.js  # Tokens de recuperación de contraseña (TTL 1h)
│   ├── public/
│   │   └── README.md               # Placeholder: los estáticos reales viven en /public (raíz)
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── product.repository.js
│   │   ├── cart.repository.js      # Incluye la lógica de compra (purchase)
│   │   ├── ticket.repository.js
│   │   └── passwordRecovery.repository.js
│   ├── routes/
│   │   ├── carts.router.js         # /api/carts — incluye POST /:cid/purchase
│   │   ├── products.router.js      # /api/products — escritura solo admin
│   │   ├── sessions.router.js      # /api/sessions — auth + recuperación de contraseña
│   │   ├── users.router.js         # /api/users — CRUD protegido por JWT + roles
│   │   └── views.router.js         # Rutas para el renderizado de plantillas Handlebars
│   ├── services/
│   │   └── mail.service.js         # Envío de correos con Nodemailer
│   ├── templates/
│   │   └── passwordReset.template.js # HTML del correo de recuperación
│   ├── utils/
│   │   ├── password.util.js        # createHash, isValidPassword
│   │   ├── jwt.util.js             # JWT_SECRET, generateToken, cookieExtractor
│   │   └── asyncHandler.util.js    # Envuelve controllers async para el errorHandler
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars
│   │   ├── partials/
│   │   │   └── navbar.handlebars
│   │   ├── admin-products.handlebars # Panel CRUD visual de productos (solo admin)
│   │   ├── cart.handlebars           # Vista del carrito + botón "Finalizar Compra"
│   │   ├── forgot-password.handlebars # Pedir el correo de recuperación
│   │   ├── reset-password.handlebars  # Definir la nueva contraseña (token por query string)
│   │   ├── home.handlebars           # Vista de inicio ("terminal SSR")
│   │   ├── login.handlebars
│   │   ├── products.handlebars
│   │   ├── profile.handlebars
│   │   ├── register.handlebars
│   │   └── realTimeProducts.handlebars
│   ├── app.js
│   └── seed.js
├── .env                            # Variables de entorno (privadas)
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── asignarCarrito.js                # Script: asigna un carrito a un usuario existente sin uno
├── resetUser.js                    # Script: (re)crea un usuario admin de prueba
├── package.json
└── README.md
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
    JWT_SECRET=una-cadena-larga-y-aleatoria
    SESSION_SECRET=otra-cadena-larga-y-aleatoria-distinta-de-jwt-secret

    MAIL_SERVICE=gmail
    MAIL_USER=tu-correo@gmail.com
    MAIL_PASS=tu-contraseña-de-aplicacion-de-16-caracteres
    ```

    * Si tu contraseña de MongoDB Atlas tiene caracteres especiales (`@ : / ? # % [ ]` o espacios), codificalos (URL-encode) dentro de la `MONGO_URI` o vas a obtener `MongoParseError: Invalid connection string`. Ejemplo: `@` se escribe como `%40`.
    * `MAIL_PASS` (si usás Gmail) **no** es tu contraseña normal: es una "contraseña de aplicación" de 16 caracteres que generás en [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requiere verificación en 2 pasos activada). Con otros proveedores de correo, `MAIL_SERVICE` cambia según lo que soporte Nodemailer.

3. Levantar el servidor:

    ```bash
    npm run dev
    ```

4. (Opcional) Crear un usuario administrador de prueba:

    ```bash
    node resetUser.js
    ```

5. (Opcional) Poblar el catálogo con productos de ejemplo:

    ```bash
    node src/seed.js
    ```

---

## Acceso a la aplicación (vistas)

* Registro: `http://localhost:8080/register`
* Login: `http://localhost:8080/login`
* Recuperar contraseña: `http://localhost:8080/forgot-password`
* Inicio (catálogo, terminal SSR): `http://localhost:8080/`
* Catálogo paginado: `http://localhost:8080/products`
* Vista del carrito (con botón de compra): `http://localhost:8080/carts/:cid`
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
| `age` | Number | Obligatorio para registro local (se valida en la estrategia `register`); ausente en cuentas de OAuth que no lo entregan |
| `password` | String | Hasheado con `bcrypt.hashSync`; ausente en cuentas creadas por OAuth. Nunca se devuelve en las respuestas |
| `cart` | ObjectId | Referencia a `carts`, se crea automáticamente al registrarse (local u OAuth) |
| `role` | String | `'user'` por defecto |
| `provider` | String | `'local'` por defecto, o `'github'` / `'google'` / `'microsoft'` si la cuenta se creó (o vinculó) vía login social |
| `providerId` | String | ID de la cuenta en el proveedor externo (vacío para cuentas locales) |

### Estrategias de Passport

* **`register`** — delega en `userRepository.registerUser()`: valida email único, hashea el password y crea el carrito propio.
* **`login`** — valida credenciales vía `userRepository.getByEmail()`.
* **`current`** (JWT) — valida el token (cookie httpOnly o header Bearer) y reconsulta al usuario vía `userRepository.getById()`.
* **`github` / `google` / `microsoft`** (opcionales) — login social. Cada una delega en `userRepository.findOrCreateOAuthUser()`, que reutiliza la cuenta si ya existe (por proveedor+ID, o vinculándola a una cuenta local con el mismo email) o crea una nueva con su propio carrito. Emiten el **mismo JWT** que el login local — desde la cookie en adelante no hay diferencia entre haber entrado con email/password o con GitHub.

### Login social (GitHub, Google, Microsoft)

Cada proveedor se activa **solo si sus variables están completas** en el `.env` (ver `.env.example`). Si faltan, esa opción no aparece en el login/registro y el resto de la app sigue funcionando sin problema — no hace falta configurar los tres.

| Proveedor | Dónde registrar la app | Variables |
|---|---|---|
| GitHub | [github.com/settings/developers](https://github.com/settings/developers) → "New OAuth App" | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` |
| Google | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → "Create Credentials" → "OAuth client ID" | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| Microsoft | [portal.azure.com](https://portal.azure.com) → Microsoft Entra ID → App registrations → "New registration" | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_CALLBACK_URL`, `MICROSOFT_TENANT` |

**Restringir el login de Microsoft a una sola institución educativa:** al registrar la app en Azure, elegí "Accounts in this organizational directory only (Single tenant)" — así solo esa institución puede autenticarse. Copiá el "Directory (tenant) ID" desde la pantalla "Overview" de la app y ponelo en `MICROSOFT_TENANT` (en vez de `common`, `organizations` o `consumers`). Esto requiere permisos para registrar apps en el tenant de Azure de esa institución (en muchas universidades/colegios eso lo controla el área de IT).

En cada proveedor, la URL de callback que configures en su panel tiene que ser **exactamente igual** a la que pusiste en el `.env` (incluyendo `http://` vs `https://` y el puerto), o el proveedor va a rechazar el login con un error de "redirect_uri_mismatch" o similar.

Endpoints que quedan disponibles (solo los de los proveedores configurados):

* `GET /api/sessions/github` / `GET /api/sessions/github/callback`
* `GET /api/sessions/google` / `GET /api/sessions/google/callback`
* `GET /api/sessions/microsoft` / `GET /api/sessions/microsoft/callback`

El navegador abre la primera ruta directamente (no es un `fetch()`, es un link normal `<a href>`); el proveedor redirige de vuelta a la ruta `/callback`, que arma el JWT y redirige a `/products` — igual que el login local, pero sin pasar por el formulario.

### GET /api/sessions/current — ahora responde un DTO

En vez del documento completo de Mongo, devuelve un `CurrentUserDTO` con **solo** lo necesario: `first_name`, `last_name`, `email`, `age`, `role`. Sin `_id`, sin `cart`, sin timestamps internos y, por supuesto, sin el hash del password.

```json
{
  "status": "success",
  "payload": {
    "first_name": "Ana",
    "last_name": "Gómez",
    "email": "ana@test.com",
    "age": 28,
    "role": "user"
  }
}
```

### Sistema de recuperación de contraseña

1. `POST /api/sessions/forgot-password` con `{ "email": "..." }` — genera un token aleatorio, lo guarda con vencimiento a **1 hora** y envía un correo con un botón que lleva a `/reset-password?token=...`. Siempre responde el mismo mensaje exista o no el email (no revela qué correos están registrados).
2. El usuario abre el enlace, define una nueva contraseña en `/reset-password`.
3. `POST /api/sessions/reset-password` con `{ "token": "...", "newPassword": "..." }` valida:
   * que el token exista,
   * que no haya sido usado antes,
   * que no haya expirado (1 hora),
   * y que la nueva contraseña **no sea igual a la anterior** (se compara con `bcrypt.compareSync` contra el hash actual).

   Los tokens vencidos además se autoeliminan de la base de datos gracias a un índice TTL en `passwordToken.model.js`.

### CRUD de usuarios (`/api/users`)

| Método | Ruta | Quién puede |
|---|---|---|
| GET | `/api/users` | Solo `admin` |
| GET | `/api/users/:uid` | El dueño de la cuenta o `admin` |
| PUT | `/api/users/:uid` | El dueño de la cuenta o `admin` (el `role` solo lo cambia un `admin`) |
| DELETE | `/api/users/:uid` | Solo `admin` |

---

## Roles y autorizaciones en la lógica de compra

| Acción | Quién puede | Middleware |
|---|---|---|
| Crear / actualizar / eliminar **productos** | Solo `admin` | `authorization(['admin'])` |
| Ver un producto / listar catálogo | Cualquiera (público) | — |
| Agregar un producto **a su carrito** | Solo `role: 'user'` (un admin no compra) | `authorization(['user'])` + `isCartOwner` |
| Ver / modificar cantidades / vaciar **su carrito** | Dueño del carrito o `admin` | `isCartOwner` |
| **Finalizar la compra** de un carrito | Solo `role: 'user'`, dueño de ese carrito | `authorization(['user'])` + `isCartOwner` |

Un administrador puede gestionar cualquier carrito (verlo, vaciarlo) para soporte, pero no puede agregar productos ni comprar — esas son acciones del rol comprador.

---

## Endpoints de la API REST

> Todas las rutas de `/api/carts` y `/api/users`, y las escrituras (`POST`/`PUT`/`DELETE`) de `/api/products`, requieren un JWT válido.

### Productos (`/api/products`)

* `GET /api/products` — Listado paginado, público. `?limit=5&page=1&sort=asc&query=categoria`
* `GET /api/products/:pid` — Consulta de un producto por ID. Público.
* `POST /api/products` — Crea un producto. **Solo `admin`.**
* `PUT /api/products/:pid` — Actualiza un producto. **Solo `admin`.**
* `DELETE /api/products/:pid` — Elimina un producto. **Solo `admin`.**

### Carritos (`/api/carts`)

* `POST /api/carts` — Crea un carrito suelto. **Solo `admin`.**
* `GET /api/carts/:cid` — Consulta el carrito (populado). **Dueño o `admin`.**
* `POST /api/carts/:cid/products/:pid` — Agrega un producto (o suma +1). **Solo `role: 'user'`, dueño del carrito.**
* `PUT /api/carts/:cid/products/:pid` — Actualiza la cantidad de un producto. **Dueño o `admin`.**
* `PUT /api/carts/:cid` — Reemplaza todo el arreglo de productos. **Dueño o `admin`.**
* `DELETE /api/carts/:cid/products/:pid` — Elimina un producto del carrito. **Dueño o `admin`.**
* `DELETE /api/carts/:cid` — Vacía el carrito. **Dueño o `admin`.**
* `POST /api/carts/:cid/purchase` — **Finaliza la compra.** Solo `role: 'user'`, dueño del carrito. Ver detalle abajo.

### Sesiones (`/api/sessions`)

* `POST /api/sessions/register`, `POST /api/sessions/login`, `GET /api/sessions/current` (DTO), `GET /api/sessions/logout`
* `POST /api/sessions/forgot-password`, `POST /api/sessions/reset-password`

---

## Lógica de compra (`POST /api/carts/:cid/purchase`)

Implementada en `cart.repository.js -> purchase()`:

1. Recorre cada producto del carrito.
2. Por cada uno, intenta descontar el stock de forma **atómica y condicional** (`findOneAndUpdate` con filtro `stock >= cantidad`), evitando que dos compras simultáneas dejen el stock en negativo.
3. Si había stock suficiente: el producto queda "comprado" y su importe se suma al total.
4. Si NO había stock suficiente: el producto se deja intacto en el carrito (compra parcial).
5. Al finalizar:
   * El carrito queda solo con los productos que no se pudieron comprar (o vacío, si se compró todo).
   * Si se compró al menos un producto, se genera un **Ticket**.

### Modelo `Ticket`

| Campo | Tipo | Descripción |
|---|---|---|
| `code` | String (único) | Identificador de la compra, generado automáticamente |
| `purchase_datetime` | Date | Fecha y hora de la compra |
| `amount` | Number | Monto total de lo efectivamente comprado |
| `purchaser` | String | Email de quien compró |

### Respuesta

```json
{
  "status": "success",
  "message": "Compra parcial: algunos productos no tenían stock suficiente y quedaron en tu carrito.",
  "payload": {
    "ticket": { "code": "...", "amount": 149.98, "purchaser": "ana@test.com", "purchase_datetime": "..." },
    "failedProducts": ["66f0...a1", "66f0...b2"]
  }
}
```

Si ningún producto tenía stock, no se genera ticket y la respuesta es `400` con el detalle de `failedProducts`.

---

## Panel de administración de productos

Disponible en `/admin/products`, únicamente para `role: 'admin'`. Permite crear, editar y eliminar productos desde el navegador sin usar Postman/Insomnia — por debajo usa los mismos endpoints de `/api/products` ya protegidos por rol.

---

## Scripts de utilidad

| Script | Uso | Qué hace |
|---|---|---|
| `resetUser.js` | `node resetUser.js` | (Re)crea un usuario `admin` de prueba, con su carrito asignado. |
| `asignarCarrito.js` | `node asignarCarrito.js correo@usuario.com [edad]` | Le crea y asigna un carrito a un usuario existente que no tenga uno. El `[edad]` es opcional, para completar usuarios viejos a los que les falte ese campo. |
| `eliminarUsuario.js` | `node eliminarUsuario.js correo@usuario.com` | Elimina un usuario (pide confirmación por consola) y, si tiene, su carrito asociado. |
| `src/seed.js` | `node src/seed.js` | Puebla la colección `products` con datos de ejemplo. |

---

## Notas de seguridad

* Las contraseñas se hashean con `bcrypt.hashSync`; el modelo `User` excluye `password` de cualquier respuesta JSON, y `/current` además usa un DTO explícito que ni siquiera incluye `_id` o `cart`.
* El JWT viaja en una cookie `httpOnly` (no accesible desde JavaScript del navegador).
* Los tokens de recuperación de contraseña expiran en 1 hora y no pueden reutilizarse una vez usados (además de autoeliminarse por índice TTL).
* `.env` está excluido de git vía `.gitignore` y del zip de entrega — no se sube a ningún repositorio. Cada quien configura su propio `.env` localmente a partir de `.env.example`.
* El servidor no imprime la `MONGO_URI` completa en consola al conectar.

---

## Autor
Oscar Orozco - Full Stack Web Developer.
