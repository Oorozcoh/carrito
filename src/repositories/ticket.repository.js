// src/repositories/ticket.repository.js
import TicketDAO from '../dao/ticket.dao.js';

class TicketRepository {
    constructor() {
        this.dao = new TicketDAO();
    }

    createTicket({ amount, purchaser }) {
        return this.dao.create({ amount, purchaser });
    }

    getById(id) {
        return this.dao.findById(id);
    }
}

export default new TicketRepository();
