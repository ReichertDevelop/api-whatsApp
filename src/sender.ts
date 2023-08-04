import { create, Whatsapp, SocketState } from "venom-bot"
import { isValidPhoneNumber } from "libphonenumber-js"

export type QRCode = {
    base64Qr: string;
    asciiQR: string;
    attempts: number;
}


export default class Sender {
    private client: Whatsapp;
    private connected: boolean;
    private qr: QRCode;

    get isConnected(): boolean {
        return this.connected;
    }

    get qrCode(): QRCode {
        return this.qr;
    }

    constructor() { }

    async cleanFileQr() {
        const content = { qrCode: "" }
        this.writeFileJson(content);
    }

    async initialize(session: string) {

        const start = (client: Whatsapp) => {
            this.client = client;
            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED;
            })
        }

        await create(session, (base64Qr, asciiQR, attempts) => {
            console.log(asciiQR);
            this.connected = base64Qr == null ? true : false;
            this.qr = { base64Qr, asciiQR, attempts };

            if (this.qr) {
                const content = { qrCode: this.qr.base64Qr }
                this.writeFileJson(content);
            }

        }, (isLogged) => {

            if (isLogged == 'qrReadFail') {
                this.connected = false;
            } else {
                this.connected = true;
            }
            console.log('isLogged: ', isLogged);
        },
            { autoClose: 120000 })
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }

    writeFileJson(content: { qrCode: string; }) {
        const fs = require('fs');
        fs.writeFile('C:/api-whatsApp/test.json', JSON.stringify(content), (err: any) => {
            if (err) {
                console.error(err);
            }
        });
    }

    async sendText(to: string, body: string) {
        let phoneNumber = await this.valiatePhoneNumber(to);
        await this.client.sendText(phoneNumber, body);
    }

    async sendVoice(to: string, body: string) {
        let phoneNumber = await this.valiatePhoneNumber(to);
        await this.client.sendVoice(phoneNumber, body);
    }

    async valiatePhoneNumber(to: string) {
        if (isValidPhoneNumber(to, 'BR')) {
            throw new Error("This number is not valid");
        }

        let phoneNumber = to.replace('+', '');
        phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`;
        return phoneNumber;
    }
}