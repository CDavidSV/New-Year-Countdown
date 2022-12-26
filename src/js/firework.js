// Document variables.
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');

// Variables.
const mainColor = '#0F0F0F';

context.fillStyle = mainColor;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Events.
window.addEventListener('resize', resizeCanvas);

class Particle {
    gravity = 2;

    constructor(posX, posY, size, vel, acc, angle, color) {
        this.size = size;
        this.posX = posX;
        this.posY = posY;
        this.vel = vel;
        this.acc = acc;
        this.color = color;
        this.angle = - angle * (Math.PI / 180);
    }

    drawParticle() {
        context.beginPath();
        context.fillStyle = "white";
        context.arc(this.posX, this.posY, this.size / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    addVel() {
        const vx = this.vel * Math.cos(this.angle);
        const vy = this.vel * Math.sin(this.angle);

        this.posX += vx;
        this.posY += vy;
    }

    update() {
        context.fillStyle = mainColor;
        context.fillRect(0,0,canvas.width, canvas.height);
        this.addVel();
        this.drawParticle();
    }
 
}

class Firework {
    constructor(particles, time, color) {
        this.particles = particles;
        this.time = time;
        this.color = color;
    }

    shootFirework() {

    }
}

class FireworkShow {
    loop = false;
    fireworkLoop;
    
    constructor() {

    }
    
    generateRandomFirework() {
    
    }
    
    startLoop() {
        if (this.loop === true) return;
        this.loop = true;
        fireworkLoop = setInterval(generateRandomFirework, getRand(500, 1500));
    }
    
    endLoop() {
        if (this.loop === false) return;
        this.loop = false;
        clearInterval(fireworkLoops);
    }
}

// Functions.
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getRand(min, max) {

}

const particle = new Particle(200, 800, 20, 50, 0, 90, "white");
setInterval(() => {
    particle.update();
}, 100);