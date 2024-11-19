import { CanvasParticle } from './CanvasParticle';

export class Snowflake extends CanvasParticle {
    private dx: number;
    private dxMax: number;
    private dy: number;
    private sway: number;
    private xSwayCenter: number;
    private directions: number[];
    private direction: number;

    constructor(posX: number, posY: number, color: string, radius: number, dy: number, sway: number) {
        super(posX, posY, color, radius);
        this.xSwayCenter = posX;
        this.dy = dy;
        this.sway = sway;
        this.dxMax = Math.random() * 0.5;
        this.dx = this.dxMax;
        this.directions = [0, 1]
        this.direction =this.directions[Math.floor(Math.random()*this.directions.length)]; // 1 = right, 0 = left
    }

    public update() {
        this.posY += this.dy;
        this.posX += this.dx;

        // If the snowflake changes direction, progressively change the dx value to create a smooth transition in direction.
        if (this.direction === 0 && this.dx >= -this.dxMax) {
            this.dx -= 0.001;
        } else if (this.direction === 1 && this.dx <= this.dxMax) {
            this.dx += 0.001;
        }

        // We check if the snowflake has reached the edge of its sway, and if so, change direction.
        if (this.posX - this.xSwayCenter >= this.sway) {
            this.direction = 0;
        }
        if (this.posX - this.xSwayCenter <= -this.sway) {
            this.direction = 1;
        }
    }
}
