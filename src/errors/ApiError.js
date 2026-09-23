// src/errors/ApiError.js
//
// Error tipado con su propio status HTTP. Los repositories lanzan
// instancias de esta clase en vez de un Error genérico con un campo
// `.code` suelto — así el error "sabe" qué respuesta HTTP le
// corresponde, y el errorHandler (ver errorHandler.middleware.js) no
// necesita un mapeo manual de códigos a status en cada controller.
export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }

    static badRequest(message) {
        return new ApiError(400, message);
    }

    static unauthorized(message) {
        return new ApiError(401, message);
    }

    static forbidden(message) {
        return new ApiError(403, message);
    }

    static notFound(message) {
        return new ApiError(404, message);
    }

    static conflict(message) {
        return new ApiError(409, message);
    }

    static internal(message) {
        return new ApiError(500, message);
    }
}
