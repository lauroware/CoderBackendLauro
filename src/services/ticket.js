import TicketRepository from "../repositories/tickets.repository.js";

const ticketRepository = new TicketRepository();

const serviceCreateTicket = async (newTicket) => {
    let createdTicket = await ticketRepository.createNewTicket(newTicket);
    return createdTicket;
}

const serviceFindTicketByPurchaser = async (uid) => {
    let existTicket = await ticketRepository.findTicketByPurchaser(uid);
    return existTicket;
}

export { serviceCreateTicket, serviceFindTicketByPurchaser }