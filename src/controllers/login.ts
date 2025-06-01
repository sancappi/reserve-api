import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/usuario.js";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET as string;

const efetuarLogin = async (req: Request, res: Response): Promise<void> => {
    const {email, senha} = req.body;
    try {
        const usuario = await Usuario.findOne({email});
        if (!usuario) {
            res.status(404).json({message: "E-mail não encontrado."});
            return;
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) { 
            res.status(404).json({message: "Senha incorreta."});
            return;
        }
        const token = jwt.sign({id: usuario.id, tipoPerfil: usuario.tipoPerfil},
            secret, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });

        if(usuario.tipoPerfil === "cliente") {
            res.status(200).json({tipoPerfil: "cliente"});
        } else if(usuario.tipoPerfil === "gestor"){
            res.status(200).json({tipoPerfil:"gestor"});
        } else {
            res.status(404).json({message: "Tipo de perfil inválido."});
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    }
};


const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token",
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            });
        res.status(204).json({ message: "Logout realizado com sucesso."});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."})
    }    
};


export default {
    efetuarLogin,
    logout
};