import { Router } from "express";
import login from "../controllers/login.js";
import gestao from "../controllers/gestao.js";
import senha from "../controllers/senha.js";
import usuario from "../controllers/usuario.js";
import { autenticado } from "../config/middleware/autenticar.js";

const router = Router();

router.post("/login", login.efetuarLogin);
router.post("/logout", autenticado, login.logout);
router.post("/email", senha.checar);
router.post("/senha", senha.atualizar);
router.post("/cadastrar", usuario.cadastrar);
router.get("/usuarios", autenticado, usuario.retornarUsuario);
router.post("/atualizar_dados", autenticado, usuario.atualizarEmailNome);
router.post("/atualizar_senha", autenticado, usuario.atualizarSenha);
router.delete("/excluir_usuario", autenticado, usuario.deletarConta);
router.post("/salvar_reserva", autenticado, usuario.salvarReserva);
router.post("/disponiveis", autenticado, usuario.disponiveis);
router.get("/reservas", autenticado, usuario.reservas);
router.delete("/excluir_reserva/:id", autenticado, usuario.excluirReserva);
router.post("/salvar_sala", autenticado, gestao.salvarSala);
router.get("/disponibilizadas", autenticado, gestao.disponibilizadas);
router.post("/atualizar_sala/:id", autenticado, gestao.atualizarSala);
router.delete("/excluir_sala/:id", autenticado, gestao.deletarSala);
router.get("/listar", autenticado, gestao.listar);
router.post("/atualizar_cliente/:id", autenticado, gestao.editarDadosCliente);
router.delete("/excluir_cliente/:id", autenticado, gestao.excluirCliente);

export default router;