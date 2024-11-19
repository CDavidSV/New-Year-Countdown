export class CanvasParticle {
    public posX: number;
    public posY: number;
    public color: string;
    public radius: number;

    constructor(posX: number, posY: number, color: string, radius: number) {
        this.posX = posX;
        this.posY = posY;
        this.color = color;
        this.radius = radius;
    }

    public draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}
