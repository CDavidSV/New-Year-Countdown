import { CanvasParticle } from './CanvasParticle';

export class Firework extends CanvasParticle {
    private gravity: number;
    private dx: number;
    private dy: number;

    constructor(posX: number, posY: number, color: string, radius: number, dx: number, dy: number, gravity: number) {
        super(posX, posY, color, radius);
        this.gravity = gravity;
        this.dx = dx;
        this.dy = dy;
    }

    update() {
        this.posY += this.dy;
        this.posX += this.dx;
        this.dy += this.gravity;
    }
}
