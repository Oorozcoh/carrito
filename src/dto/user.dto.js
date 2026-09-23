// src/dto/user.dto.js
//
// CONSIGNA - Punto 2: Modificación de la ruta /current
// El DTO define explícitamente qué sale hacia afuera. GET /current ya
// no devuelve el documento de Mongo tal cual (que incluye _id, cart,
// timestamps, etc.) — solo lo que un cliente necesita para saber
// "quién soy y qué puedo hacer": nombre, email, edad y rol. Nada de
// identificadores internos de la base de datos ni referencias al
// carrito, que no son necesarios para ese propósito y sí son un dato
// interno de la aplicación.
export class CurrentUserDTO {
    constructor(user) {
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
    }
}
