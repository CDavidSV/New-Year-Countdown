import { CanvasParticle } from './CanvasParticle';

export class FireworkParticle extends CanvasParticle {
    private speed: number;
    private gravity: number;
    private friction: number;
    private dx: number;
    private dy: number;

    constructor(posX: number, posY: number, color: string, radius: number, angle: number, speed: number, friction: number = 0.95) {
        super(posX, posY, color, radius);
        this.speed = speed;
        this.gravity = 0.1;
        this.friction = friction;
        this.dx = this.speed * Math.cos(angle * Math.PI / 180);
        this.dy = this.speed * Math.sin(angle * Math.PI / 180);
    }

    public update() {
        this.posY += this.dy;
        this.posX += this.dx;

        this.dy *= this.friction;
        this.dx *= this.friction;
        this.gravity *= this.friction;

        this.dy += this.gravity;
    }
}
