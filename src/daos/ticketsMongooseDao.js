import { ticketModel } from "../models/tickets.model.js";
import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import TicketDTO from "../DTOs/tickets.dto.js";

const allTicketsFromObject = (tickets) => {
    return tickets.map((ticket) => {
        const { _id, code, purchase_datetime, amount, purcharser } = ticket;
        return new TicketDTO(_id, code, purchase_datetime, amount, purcharser);
    })
}

class TicketsDAOMongoDb extends ContenedorMongoDb {
    async createNewTicket(ticket) {
        try {
            const newTicket = await this.save(ticket);
            return newTicket;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findTicketByPurchaser(uid) {
        try {
            let existTicket = await ticketModel.find({ purchaser: uid });
            return allTicketsFromObject(existTicket);
        } catch (error) {
            throw new Error(error);
        }

    }
}

export default TicketsDAOMongoDb;