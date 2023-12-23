class Snowflake extends CanvasParticle {
    constructor(posX, posY, color, radius, dy, sway) {
        super(posX, posY, color, radius);
        this.xSwayCenter = posX;
        this.dy = dy;
        this.sway = sway;
        this.dxMax = Math.random() * 0.5;
        this.dx = this.dxMax;
        this.directions = [0, 1]
        this.direction =this.directions[Math.floor(Math.random()*this.directions.length)]; // 1 = right, 0 = left
    }

    update() {
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