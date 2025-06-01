import { Request, Response } from "express";
import { Usuario } from "../models/usuario.js";
import { Sala } from "../models/gestao.js";
import { Types } from "mongoose";

export interface SalaDados {
    id?: Types.ObjectId;
    titulo: string;
    capacidade: number | string;
    capacidadePersonalizada?: number | string;
    recursos: string[] | [];
    abertura: string;
    fechamento: string;
    observacoes?: string | null | undefined;
    notificacao?: number | null | undefined;
    notificacaoInput?: number;
    foto?: string | null | undefined;
}; 

const salvarSala = async (req: Request, res: Response): Promise<void> => {
    const {titulo, capacidade, capacidadePersonalizada, recursos, abertura, fechamento,
        observacoes, notificacaoInput, foto} = req.body;

    let notificacaoEnviar = null;
    let capacidadeEnviar = null;

    if (notificacaoInput !== null) notificacaoEnviar = notificacaoInput;

    if (capacidade === "mais20" && capacidadePersonalizada !== "") {
        capacidadeEnviar = capacidadePersonalizada;
    } else {
        capacidadeEnviar = capacidade;
    }

    const dadosSala: SalaDados = {
        titulo: titulo,
        capacidade: capacidadeEnviar,
        recursos: Array.isArray(recursos)? recursos: [recursos],
        abertura: abertura,
        fechamento: fechamento,
        observacoes: observacoes,
        notificacao: Number(notificacaoEnviar),
        foto: foto
    };

    try {
        const novaSala =  new Sala(dadosSala);
        await novaSala.save();
        res.status(204).json({message: "Sala criada com sucesso."});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
        return;
    };
};

const disponibilizadas = async (req: Request, res: Response): Promise<void> => {
    try {
        const salas = await Sala.find({});
        res.status(200).json(salas);
    } catch(e){
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const atualizarSala = async (req: Request, res: Response): Promise<void> => {
    const salaId = req.params.id;
    const {titulo, capacidade, capacidadePersonalizada, recursos, abertura, fechamento,
        observacoes, notificacaoInput, foto} = req.body;
    
    let notificacaoEnviar = null;
    let capacidadeEnviar = null;

    if (notificacaoInput !== null) notificacaoEnviar = notificacaoInput;

    if (capacidade === "mais20" && capacidadePersonalizada !== "") {
        capacidadeEnviar = capacidadePersonalizada;
    } else {
        capacidadeEnviar = capacidade;
    }

    const atualizarSala: SalaDados = {
        titulo: titulo,
        capacidade: capacidadeEnviar,
        recursos: Array.isArray(recursos)? recursos: [recursos],
        abertura: abertura,
        fechamento: fechamento,
        observacoes: observacoes,
        notificacao: Number(notificacaoEnviar),
        foto: foto
    };

    try {
        const salaAtualizada = await Sala.findByIdAndUpdate(salaId, atualizarSala, {new: true});

        if (!salaAtualizada) {
            res.status(404).json({message: "Sala nao encontrada."});
            return;
        }
        res.status(204).json({ message: "Sala atualizada com sucesso."});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const deletarSala = async (req: Request, res: Response): Promise<void> => {
    const salaId = req.params.id;
    try {
        const sala = await Sala.findByIdAndDelete(salaId);
        if (!sala) {
            res.status(404).json({message: "Sala não encontrada."});
        }
        res.status(204).json({message: "Sala deletada com sucesso."});
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const listar = async (req: Request, res: Response): Promise<void> => {
    try {
        const clientes = await Usuario.find({tipoPerfil: "cliente"});
        res.status(200).json(clientes);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

const editarDadosCliente = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const {nome, email} = req.body;

    const atualizarCliente = {
        nome: nome,
        email: email
    };

    try {
        const cliente = await Usuario.findByIdAndUpdate(id, atualizarCliente, {new: true});

        if (!cliente) {
            res.status(404).json({message: "Cliente não encontrado."});
            return;
        }
        console.log("cliente", cliente);
        res.status(200).json(cliente);
    } catch(e){
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."})
    };
};

const excluirCliente = async (req: Request, res: Response) => {
    const clienteId = req.params.id;
    try {
        const cliente = await Usuario.findByIdAndDelete(clienteId);
        if (!cliente) {
            res.status(404).json({ message: "Cliente nao encontrado."});
            return;
        }
        res.status(204);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Erro interno do servidor."});
    };
};

export default  {
    salvarSala,
    disponibilizadas,
    atualizarSala,
    deletarSala,
    listar,
    editarDadosCliente,
    excluirCliente  
};