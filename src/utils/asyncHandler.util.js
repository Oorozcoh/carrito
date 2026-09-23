// src/utils/asyncHandler.util.js
//
// Envuelve un controller async para que cualquier error que lance
// (incluyendo los ApiError de los repositories) llegue automáticamente
// a next(error) -> errorHandler.middleware.js, sin repetir un
// try/catch idéntico en cada controller.
//
// Uso: router.get('/', asyncHandler(productController.getAll))
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
