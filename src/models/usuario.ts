import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    tipoPerfil: {
        type: String,
        enum: ["cliente", "gestor"],
        required: true
    },
    resetToken: String,
    resetTokenExp: Date
}, {collection: "Usuario"});

export const Usuario = mongoose.model("Usuario", usuarioSchema);