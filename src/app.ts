require("dotenv").config();

import express from "express";
import BOT from "./bot";
import { DB } from "./database";

const app = express();
const bot = new BOT();
const db = new DB();

app.set("port", process.env.PORT || 4000);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("que lees puta");
});

app.listen(app.get("port"), async () => {
    console.log(`Servidor iniciado en el puerto: ${app.get("port")}`);
    await db.conectar(process.env.DB);
    bot.iniciar(process.env.TOKEN);
});