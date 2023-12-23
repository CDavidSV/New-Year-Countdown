class Firework extends CanvasParticle {
    constructor(posX, posY, color, radius, dx, dy, gravity) {
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