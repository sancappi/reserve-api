import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporterEmail } from "../config/nodemailerConfig.js";
import { Usuario } from "../models/usuario.js";
import dotenv from "dotenv";

dotenv.config();

const checar = async (req: Request, res: Response): Promise<void> => {
    const {email} = req.body;
    const url_email = process.env.URL_EMAIL as string;
    try {
        const usuario = await Usuario.findOne({email});
        if (!usuario) {
            res.status(404).json({message: "E-mail não cadastrado."});
            return;
        }

        const transporterCriado = transporterEmail();
        const token = crypto.randomBytes(20).toString("hex");
        const tokenExp = Date.now() + 3600000;
        usuario.resetToken = token;
        usuario.resetTokenExp = new Date(tokenExp);
        await usuario.save();

        const opcoes = {
            from: process.env.EMAIL as string,
            to: email,
            subject: "Redefinição de senha",
            html: `Link para redefinição de senha: 
                <a href="${url_email}/recuperar_senha?token=${token}">
                    redefinir senha
                <a/>`
        };
        
        try {
            await transporterCriado?.sendMail(opcoes);
            res.status(204).json({message: "E-mail de recuperação enviado com sucesso."});
            return;
        } catch (e) {
            console.error(e);
            res.status(500).json({message: "Erro interno do servidor."});
            return;
        };
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Erro interno do servidor."});
        return;
    };
};

const atualizar = async (req: Request, res: Response): Promise<void> => {    
    const {senha, token} = req.body;
    try {
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExp: {
                $gt: Date.now()
            }
        });

        if (senha === "" || senha === null || undefined) {
            res.status(400);
            return;
        }
        
        if (!usuario) {
            res.status(404).json({message: "Token inválido ou expirado."});
        } else { 
            const salt = 10;
            const hashedSenha = await bcrypt.hash(senha, salt);

            usuario.senha = hashedSenha;
            usuario.resetToken = null;
            usuario.resetTokenExp= null;

            await usuario.save();
            res.status(204).json({message: "Senha atualizada com sucesso."});
        }
    } 
    catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

export default {
    checar,
    atualizar
};


