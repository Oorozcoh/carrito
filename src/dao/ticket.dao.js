// src/dao/ticket.dao.js
import { ticketModel } from '../models/ticket.model.js';

export default class TicketDAO {
    create(data) {
        return ticketModel.create(data);
    }

    findById(id) {
        return ticketModel.findById(id);
    }
}
