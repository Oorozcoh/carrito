// src/repositories/user.repository.js
//
// CONSIGNA - Punto 1: Patrón Repository
// Concentra la lógica de negocio relacionada a usuarios (registro,
// búsqueda, actualización) usando el UserDAO para persistencia. Ni las
// estrategias de Passport ni los routers tocan el modelo de Mongoose
// directamente — todos pasan por acá.
import UserDAO from '../dao/user.dao.js';
import CartDAO from '../dao/cart.dao.js';
import { createHash } from '../utils/password.util.js';
import { ApiError } from '../errors/ApiError.js';

class UserRepository {
    constructor() {
        this.userDao = new UserDAO();
        this.cartDao = new CartDAO();
    }

    getByEmail(email) {
        return this.userDao.findByEmail(email);
    }

    getById(id) {
        return this.userDao.findById(id);
    }

    getAll() {
        return this.userDao.findAll();
    }

    /**
     * Lógica de negocio de registro: valida email único, crea el
     * carrito propio del usuario y hashea la contraseña con
     * bcrypt.hashSync (createHash) antes de persistir.
     */
    async registerUser({ first_name, last_name, email, age, password }) {
        const exists = await this.userDao.findByEmail(email);
        if (exists) {
            throw ApiError.conflict('Ya existe un usuario registrado con ese email.');
        }

        const newCart = await this.cartDao.create({ products: [] });

        return this.userDao.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: newCart._id
        });
    }

    updateUser(id, data) {
        return this.userDao.updateById(id, data);
    }

    deleteUser(id) {
        return this.userDao.deleteById(id);
    }

    /**
     * Lógica de negocio del login social (GitHub/Google/Microsoft).
     * Se invoca desde cada estrategia OAuth de Passport con el perfil
     * ya normalizado. Reglas:
     *   1. Si ya existe una cuenta vinculada a ESTE proveedor + ID
     *      externo, se reutiliza tal cual (logins siguientes).
     *   2. Si no, pero existe una cuenta LOCAL (u de otro proveedor)
     *      con el mismo email, se vincula el proveedor a esa cuenta en
     *      vez de crear un usuario duplicado.
     *   3. Si no existe ninguna de las dos, se crea una cuenta nueva
     *      con su propio carrito — igual que el registro local, pero
     *      sin password (no aplica: el login siempre va a ser vía
     *      ese proveedor).
     */
    async findOrCreateOAuthUser({ provider, providerId, email, first_name, last_name }) {
        const existingByProvider = await this.userDao.findByProviderId(provider, providerId);
        if (existingByProvider) {
            return existingByProvider;
        }

        if (email) {
            const existingByEmail = await this.userDao.findByEmail(email);
            if (existingByEmail) {
                return this.userDao.updateById(existingByEmail._id, { provider, providerId });
            }
        }

        const newCart = await this.cartDao.create({ products: [] });

        return this.userDao.create({
            first_name: first_name || 'Usuario',
            last_name: last_name || '',
            // Algunos proveedores (típicamente GitHub, si el usuario no
            // tiene un email público) pueden no entregar email. Se arma
            // uno determinístico para no romper el `required: true` +
            // `unique` del esquema, sin arriesgar colisiones entre proveedores.
            email: email || `${provider}-${providerId}@sin-email.local`,
            cart: newCart._id,
            provider,
            providerId
        });
    }

    /**
     * Actualiza únicamente la contraseña (ya hasheada) de un usuario.
     * Usada por el flujo de recuperación de contraseña.
     */
    updatePassword(id, hashedPassword) {
        return this.userDao.updateById(id, { password: hashedPassword });
    }
}

export default new UserRepository();
