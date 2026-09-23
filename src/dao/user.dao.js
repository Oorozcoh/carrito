// src/dao/user.dao.js
//
// CONSIGNA - Punto 1: Patrón Repository / DAO
// El DAO es la ÚNICA capa que le habla directamente a Mongoose/MongoDB.
// No contiene lógica de negocio (eso vive en los Repository) — solo
// sabe leer y escribir documentos.
import { userModel } from '../models/user.model.js';

export default class UserDAO {
    create(data) {
        return userModel.create(data);
    }

    findById(id) {
        return userModel.findById(id);
    }

    findByEmail(email) {
        return userModel.findOne({ email: email.toLowerCase().trim() });
    }

    findByProviderId(provider, providerId) {
        return userModel.findOne({ provider, providerId });
    }

    findAll() {
        return userModel.find();
    }

    // updateOne (con $set) en vez de .save(): actualiza solo los campos
    // indicados sin revalidar todo el documento (ver historial del
    // proyecto: esto evitó romper usuarios viejos sin `age`).
    updateById(id, data) {
        return userModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    deleteById(id) {
        return userModel.findByIdAndDelete(id);
    }
}
