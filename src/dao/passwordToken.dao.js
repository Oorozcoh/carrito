// src/dao/passwordToken.dao.js
import { passwordTokenModel } from '../models/passwordToken.model.js';

export default class PasswordTokenDAO {
    create(data) {
        return passwordTokenModel.create(data);
    }

    findByToken(token) {
        return passwordTokenModel.findOne({ token });
    }

    markAsUsed(id) {
        return passwordTokenModel.findByIdAndUpdate(id, { $set: { used: true } }, { new: true });
    }
}
