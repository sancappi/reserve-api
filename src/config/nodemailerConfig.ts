import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const transporterEmail = () => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL as string,
            pass: process.env.SENHA as string,
        },
    });
    return transporter;
};
