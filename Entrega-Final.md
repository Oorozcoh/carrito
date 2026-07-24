# Entrega Final: Backend de eCommerce

## Requisitos Técnicos Base

* **Persistencia**: Integrar MongoDB como base de datos principal.
* **Estructura**: Mantener la lógica de negocio existente, adaptando únicamente la capa de persistencia.
* **Endpoints**: Completar y asegurar el funcionamiento de todos los endpoints correspondientes a productos y carritos.

**Nota**: La entrega final se debe incluir los puntos de los entregables anteriores.

> Realtime products

## Parte 1: API de Productos (Profesionalizada)

### **GET /api/products**

Deberá listar los productos incorporando filtros avanzados, paginación y ordenamiento.

#### Parámetros de consulta (Query Params):

| Parámetro | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `limit` | number | 10 | Cantidad de productos a devolver por página. |
| `page` | number | 1 | Número de página a consultar. |
| `query` | string | - | Filtro para búsqueda (por categoría o estado de disponibilidad). |
| `sort` | string | - | Ordenamiento por precio: "asc" (ascendente) o "desc" (descendente). |

#### Ejemplos de uso:

```http
GET /api/products?limit=5&page=2
GET /api/products?query=electronics&sort=asc
GET /api/products?query=available&sort=desc&page=1
GET /api/products?limit=20&sort=desc

```

#### Formato de respuesta obligatorio:

La API debe devolver la estructura exacta que se detalla a continuación:

```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 5,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "/api/products?page=1",
  "nextLink": "/api/products?page=3"
}

```

*(Nota: `prevLink` y `nextLink` deben ser `null` si no existe la página correspondiente).*

---

## Parte 2: API de Carritos

Se deben implementar los siguientes endpoints para la gestión avanzada de carritos:

#### 1. **DELETE** `/api/carts/:cid/products/:pid`

* **Función**: Eliminar un producto específico dentro de un carrito determinado.
* **Respuesta**: El carrito actualizado.

#### 2. **PUT** `/api/carts/:cid`

* **Función**: Actualizar el carrito con un arreglo completo de productos (reemplaza el contenido actual).
* **Body esperado**:

```json
[
  { "product": "id_del_producto_1", "quantity": 2 },
  { "product": "id_del_producto_2", "quantity": 1 }
]

```

#### 3. **PUT** `/api/carts/:cid/products/:pid`

* **Función**: Actualizar únicamente la cantidad de un producto específico dentro del carrito.
* **Body esperado**:

```json
{ "quantity": 5 }

```

#### 4. **DELETE** `/api/carts/:cid`

* **Función**: Vaciar el carrito por completo (eliminar todos los productos de su interior, sin eliminar el documento del carrito en sí).

> **Importante - Modelo de Carrito:**
> * Los productos dentro del esquema del carrito deben hacer referencia al modelo de `Products` mediante `ObjectId`.
> * Se debe implementar el método **populate** en el endpoint `GET /api/carts/:cid` para que la respuesta devuelva los detalles completos de cada producto referenciado, no solo su ID.
> 
> 

---

## Parte 3: Vistas (Frontend)

### **Vista `/products**` (Actualizada)

* Mostrar el listado de productos implementando **paginación visual**.
* Incluir controles de navegación entre páginas (botones de anterior/siguiente).
* Para la interacción con el carrito, se debe implementar una de las siguientes opciones:
* **Opción A (Vista de Detalle)**: Cada producto tiene un enlace hacia `/products/:pid`. En esta nueva vista se muestra la información completa y se ubica el botón "Agregar al carrito".
* **Opción B (Acción Directa)**: Incluir el botón "Agregar al carrito" directamente en las tarjetas de la lista general de productos, evitando la navegación a otra página.



### **Vista `/carts/:cid**` (Nueva)

* Mostrar los productos almacenados en un carrito específico.
* Renderizar únicamente los ítems que pertenezcan a dicho carrito (utilizando los datos populados).

---

## Checklist de Entrega

### API de Productos

* [ ] GET implementado con parámetros `limit`, `page`, `sort` y `query`.
* [ ] Respuesta estructurada exactamente con el formato de paginación requerido.
* [ ] Filtrado funcional por categoría y disponibilidad.
* [ ] Ordenamiento funcional por precio (ascendente y descendente).

### API de Carritos

* [ ] DELETE funcional para eliminar un producto específico del carrito.
* [ ] PUT funcional para reemplazar todos los productos del carrito.
* [ ] PUT funcional para actualizar la cantidad de un producto específico.
* [ ] DELETE funcional para vaciar completamente el carrito.
* [ ] Uso de `populate` implementado en el GET del carrito.
* [ ] Referencia correcta a `Products` (ObjectId) en el modelo de Mongoose.

### Vistas

* [ ] Página `/products` renderizada con paginación funcional.
* [ ] Implementación de la Opción A (vista detalle) o la Opción B (botón directo).
* [ ] Página `/carts/:cid` renderizada correctamente con sus productos.

### Requisitos Técnicos y de Entrega

* [ ] Persistencia en MongoDB funcionando correctamente.
* [ ] Lógica de negocio intacta, adaptada solo a la nueva persistencia.
* [ ] Repositorio subido a GitHub (sin incluir la carpeta `node_modules`).
* [ ] Código ordenado y comentado donde sea pertinente.

---

## Estructura Sugerida del Proyecto

```bash
├── src/
│   │ app.js
│   ├── models/
│   │   ├── product.model.js
│   │   └── cart.model.js
│   ├── routes/
│   │   ├── products.router.js
│   │   ├── carts.router.js
│   │   └── views.router.js
│   └── views/
│       ├── layouts/
│       ├── products.handlebars
│       ├── productDetail.handlebars
│       └── cart.handlebars
├── package.json
└── server.js

```