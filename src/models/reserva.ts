import mongoose from "mongoose";

const reservaSchema = new mongoose.Schema({
    sala: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sala",
        required: true
    },
    usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    data: {
        type: String,
        required: true
    },
    inicio: {
        type: String,
        required: true
    },
    fim: {
        type:String,
        required: true
    }
}, {collection: "Reserva"});

export const Reserva = mongoose.model("Reserva", reservaSchema);