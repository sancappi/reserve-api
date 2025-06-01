import { Request, Response } from "express";
import { Usuario } from "../models/usuario.js";
import { Reserva } from "../models/reserva.js";
import { Sala } from "../models/gestao.js";
import { SalaDados } from "./gestao.js";
import bcrypt from "bcrypt";
import {Types} from "mongoose";

const converterMin = (tempo:string): number => {
    let partes = tempo.split(":");
    let horas = parseInt(partes[0], 10);
    let minutos = parseInt(partes[1], 10);
    let total = horas * 60 + minutos;
    return total;
};

const interseccao = (inicioReserva: number, fimReserva: number, inicio: number, fim: number): boolean => inicioReserva <= fim && fimReserva >= inicio;
const intervaloContido = (salaAbertura: number, salaFechamento: number, inicioEvento: number, fimEvento: number): boolean => inicioEvento >= salaAbertura && fimEvento <= salaFechamento;

interface Reserva {
    sala: Types.ObjectId;
    usuario: Types.ObjectId;
    data: string;
    inicio: string;
    fim: string;
};

const cadastrar = async (req: Request, res: Response): Promise<void> => {
    const {nome, email, senha, tipoPerfil} = req.body;
    try {
        const emailExiste = await Usuario.findOne({email});

        if (emailExiste) {
            res.status(409).json({message: "E-mail já existe."});
            return;
        }
        const salt = 10;
        const senhaH = await bcrypt.hash(senha, salt);
        const usuario = new Usuario({
            nome: nome,
            email: email,
            senha: senhaH,
            tipoPerfil: tipoPerfil
        });

        await usuario.save();
        res.status(204).json({message: "Usuário salvo!"});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const retornarUsuario = async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    try {
        const usuario = await Usuario.findById(id);
        
        if (!usuario) {
            res.status(401).json("Usuário não encontrado.");
        }

        const retorno = {
            nome: usuario?.nome,
            email: usuario?.email
        };

        res.status(200).json(retorno);
    } catch (e) {
        res.status(500).json("Erro interno no servidor.");
    };
};

const atualizarEmailNome = async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    const {email, nome} = req.body;

    if (!email || !nome) {
        res.status(400).json({message: "Faltando dados."});
        return;
    }

    try {
        await Usuario.findByIdAndUpdate(id, {
            nome,
            email
        });
        res.status(204).json({message: "Usuário atualizado com sucesso!"});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const atualizarSenha = async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    const {atual, nova} = req.body;

    try {
        const usuario = await Usuario.findById(id);

        if (!usuario) {
            res.status(401).json({message: "Usuário não encontrado."});
            return;
        }

        const correta =  await bcrypt.compare(atual, usuario.senha);
        if (!correta){
            res.status(400).json({message: "A senha está errada."});
            return;
        }

        const senhaH = await bcrypt.hash(nova, 10);
        await Usuario.findByIdAndUpdate(id, {senha: senhaH});
        res.status(204).json({message: "Senha atualizada!"});
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Erro interno do servidor."})
    };
};

const deletarConta = async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            res.status(401).json({ message: "Usuário nao cadastrado."});
            return;
        };
        await Reserva.deleteMany({usuario: id});
        await Usuario.findByIdAndDelete(id);
        res.status(204).json({message: "Conta deletada com sucesso."});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const disponiveis = async (req: Request, res: Response): Promise<void> => {
    const {data, horaI, horaF} = req.body;
    if (!data || !horaI || !horaF) {
        res.status(400).json({message: "Faltando dados."});
        return;
    }
    
    const inicioHorario = horaI;
    const fimHorario = horaF;
    try {
        const salas = await Sala.find({});
        
        let salasRestantes: SalaDados[] = salas.filter(sala => {
            const aberturaMin = converterMin(sala.abertura);
            const fechamentoMin = converterMin(sala.fechamento);
            const inicioMin = converterMin(inicioHorario);
            const fimMin = converterMin(fimHorario);
            
            return intervaloContido(aberturaMin, fechamentoMin, inicioMin, fimMin);
        });

        let reservas = await Reserva.find({});

        if (reservas.length !== 0) {
            let reservasConflitantes = reservas.filter(reserva => reserva.data == data)
                .filter(reserva => {
                    const reservaInicio = converterMin(reserva.inicio);
                    const reservaFim = converterMin(reserva.fim);
                    const inicioMin = converterMin(inicioHorario);
                    const fimMin = converterMin(fimHorario);
                    return interseccao(reservaInicio, reservaFim, inicioMin, fimMin);
                }
            );

            salasRestantes = salasRestantes.filter(sala => {
                let choque = false;

                for (const reserva of reservasConflitantes) {
                    if (sala.id?.toString() === reserva.sala._id.toString()) {
                        choque = true;
                    }
                };
                return !choque;
            });
        }
        res.status(200).json(salasRestantes);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const salvarReserva = async (req: Request, res: Response): Promise<void> => {
    const {sala, data, inicio, fim} = req.body;
    const usuarioId = req.user?.id;
    try {
        const reservas = await Reserva.find();
        let reservasSalaIgual: Reserva[] = [];
        
        if (reservas.length !== 0) {
            await Promise.all(reservas.map(reserva => {
                let salaReserva = reserva.sala._id.toString();
                let dataReserva = reserva.data;
                if (dataReserva === data && salaReserva === sala) {
                    reservasSalaIgual.push(reserva);
                    return;
                }
            }));
            if (reservasSalaIgual.length > 0) {
                for(let i = 0; i < reservasSalaIgual.length; i++) {
                    const reservadaI = converterMin(reservasSalaIgual[i].inicio);
                    const reservadaF = converterMin(reservasSalaIgual[i].fim);
                    const inicioMin = converterMin(inicio);
                    const fimMin = converterMin(fim);

                    if (interseccao(reservadaI, reservadaF, inicioMin, fimMin)) {
                        res.status(409).json({message: "Esta sala já foi reservada."});
                        return;
                    }
                }
            }
        }
        const reserva = new Reserva({
            sala: sala,
            usuario: usuarioId,
            data: data,
            inicio: inicio,
            fim: fim
        });
        reserva.save();
        res.status(204).json({message: "Reserva realizada com sucesso!"})
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const reservas = async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    try {
        const reservas = await Reserva.find({usuario: id}).populate("sala");
        const salas = await Sala.find();
        const dados = {
            r: reservas,
            s: salas
        };
        res.status(200).json(dados);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const excluirReserva = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
        await Reserva.findByIdAndDelete({id});
        res.status(204).json({message: "Reserva excluída com sucesso!"});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};


export default {
    cadastrar,
    retornarUsuario,
    atualizarEmailNome,
    atualizarSenha,
    deletarConta,
    salvarReserva,
    disponiveis,
    reservas,
    excluirReserva,
};