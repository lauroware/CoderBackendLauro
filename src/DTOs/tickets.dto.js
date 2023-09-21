class TicketDTO {
    constructor(_id, code, purchase_datetime, amount, purcharser) {
        this._id = _id,
        this.code = code;
        this.purchase_datetime = purchase_datetime;
        this.amount = amount;
        this.purcharser = purcharser;
    }
}

export default TicketDTO