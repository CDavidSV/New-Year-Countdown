class CanvasParticle {
    constructor(posX, posY, color, radius) {
        this.posX = posX;
        this.posY = posY;
        this.color = color;
        this.radius = radius;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}