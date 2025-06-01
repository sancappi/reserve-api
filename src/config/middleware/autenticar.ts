import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                tipoPerfil: string;
            }
        }
    }
}

const secret = process.env.JWT_SECRET as string;

export const autenticado = async (req: Request, res: Response,
     next: NextFunction): Promise<void> => {        
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({message: "O cookie não foi encontrado. Acesso negado."});
            return;
        }
        try { 
            const dados = jwt.verify(token, secret) as {
                id: string,
                tipoPerfil: string 
            } 
            req.user = dados;
            next();
        } catch(e) {
            console.error(e);
            res.status(401).json({message: "Token inválido ou expirado."})
        };
};