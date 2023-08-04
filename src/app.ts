import dotenv from "dotenv";
import Sender from './sender';
import qrCode from '../test.json';

const express = require('express');
dotenv.config();
const sender = new Sender();
const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());

app.get("/", (req: any, res: any) => {
    return res.json({
        hello: 'hello'
    });
});

app.get("/status", async (req: any, res: any) => {
    try {
        await sender.cleanFileQr();
        await sender.initialize('whatsApp')
    } catch {
        throw '';
    }
    return res.send({
        connected: sender.isConnected,
    }).json()
});

app.get("/qrcode", async (req: any, res: any) => {
    try {
        if (qrCode.qrCode != null)
            return res.json({
                qrCode,
            });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ status: "error", message: error });
    }
});

app.post("/send", async (req: any, res: any) => {
    const { number, message } = req.body;

    try {
        await sender.sendText(number, message);
        //await sender.sendVoice(number, audio);
        return res.status(200).json();
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.listen(PORT, () => console.log("listening on port " + PORT));
