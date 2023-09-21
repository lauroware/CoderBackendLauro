import mongoose, { model } from "mongoose";
import { v4 } from "uuid";

const ticketSchema = new mongoose.Schema({
    code: { type: String, default: v4 },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, default: true },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, {
    timestamps: true
})


const ticketModel = mongoose.model("tickets", ticketSchema);

export { ticketSchema, ticketModel }