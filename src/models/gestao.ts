import mongoose from "mongoose";

const salaSchema = new mongoose.Schema({
    capacidade: {
        type: Number,
        required: true
    },
    foto: {
        type: String
    },
    recursos: [String],

    observacoes: {
        type: String
    },
    abertura: {
        type: String,
        required: true
    },

    fechamento: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    notificacao: {
        type: Number
    }
}, {collection: "Sala"});

export const Sala = mongoose.model("Sala", salaSchema);