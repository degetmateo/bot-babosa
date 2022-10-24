"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const bot_1 = require("./main/bot");
const app = (0, express_1.default)();
const bot = new bot_1.BOT();
app.set("port", process.env.PORT || 4000);
app.get("/", (req, res) => {
    res.send("que lees puta");
});
app.listen(app.get("port"), () => {
    console.log(`Servidor iniciado en el puerto: ${app.get("port")}`);
    bot.iniciar();
});
