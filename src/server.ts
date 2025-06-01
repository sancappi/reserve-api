import express, {Express} from "express";
import helmet from "helmet";
import cors from "cors";
import router from "./routes/rotas.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongo = process.env.URL as string;
const url = process.env.URL_EMAIL as string;

mongoose.connect(mongo);

const app: Express = express();
const port = 5000;

app.use(cors({
    origin: url,
    credentials: true
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended: true}));

app.use(router);
app.listen(port, () => {
    `Servidor rodando na porta ${port}`;
});