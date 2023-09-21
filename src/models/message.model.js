import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
});

export default messageSchema