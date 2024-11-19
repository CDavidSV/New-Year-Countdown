import { getCanvasSize, shootFirework } from "./canvasController";

export interface FireworkMessage {
    screenWidth: number;
    screenHeight: number;
    initX: number;
    initY: number;
    endX: number;
    endY: number;
    color: string;
}

const apiUrl = import.meta.env.VITE_API_URL as string;
let ws = new WebSocket(apiUrl);
let allowSend = false;

ws.onopen = () => {
    allowSend = true;
}

ws.onmessage = (e: MessageEvent) => {
    const canvasSize = getCanvasSize();

    const newFireworkOptions = JSON.parse(e.data) as FireworkMessage;

    newFireworkOptions.initX = canvasSize.width * newFireworkOptions.initX / newFireworkOptions.screenWidth;
    newFireworkOptions.initY = canvasSize.height * newFireworkOptions.initY / newFireworkOptions.screenHeight;
    newFireworkOptions.endX = canvasSize.width * newFireworkOptions.endX / newFireworkOptions.screenWidth;
    newFireworkOptions.endY = canvasSize.height * newFireworkOptions.endY / newFireworkOptions.screenHeight;

    shootFirework(newFireworkOptions);
}

ws.onclose = () => {
    allowSend = false; // Prevents sending messages when the connection is closed.

    setTimeout(() => {
        ws = new WebSocket(apiUrl);
    }, 1000);
}

export const sendMessage = (message: FireworkMessage) => {
    if (!allowSend) return;

    ws.send(JSON.stringify(message));
};
