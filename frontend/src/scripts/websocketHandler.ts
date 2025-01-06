export interface FireworkMessage {
    screenWidth: number;
    screenHeight: number;
    initX: number;
    initY: number;
    endX: number;
    endY: number;
    color: string;
    fireworksLaunched: number;
}

export class WebsocketHandler {
    private apiUrl: string = import.meta.env.VITE_WS_URL as string;
    private connected: boolean = false;
    private ws: WebSocket | null = null;
    private onMessageCallback: (message: any) => void;

    constructor(onMessageCallback: (message: any) => void) {
        this.connect();

        this.onMessageCallback = onMessageCallback;
    }

    private connect = () => {
        this.ws = new WebSocket(this.apiUrl);
        this.ws.onopen = () => {
            this.connected = true;
        }

        this.ws.onclose = () => {
            this.connected = false;

            setTimeout(() => {
                this.connect();
            }, 1000);
        }

        this.ws.onmessage = (e: MessageEvent) => {
            this.onMessageCallback(JSON.parse(e.data));
        };
    }

    public sendMessage = (message: FireworkMessage) => {
        if (!this.connected || !this.ws) return;

        this.ws.send(JSON.stringify(message));
    }

    set onMessage(callback: (message: FireworkMessage) => void) {
        this.onMessageCallback = callback;
    }
}
