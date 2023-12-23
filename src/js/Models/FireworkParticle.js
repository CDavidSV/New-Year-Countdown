class FireworkParticle extends CanvasParticle {
    constructor(posX, posY, color, radius, angle, speed, friction = 0.95) {
        super(posX, posY, color, radius);
        this.speed = speed;
        this.angle = angle;
        this.gravity = 0.1;
        this.friction = friction;
        this.dx = this.speed * Math.cos(angle * Math.PI / 180);
        this.dy = this.speed * Math.sin(angle * Math.PI / 180);
    }

    update() {
        this.posY += this.dy;
        this.posX += this.dx;

        this.dy *= this.friction;
        this.dx *= this.friction;
        this.gravity *= this.friction;

        this.dy += this.gravity;
    }
}