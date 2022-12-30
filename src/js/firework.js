// Document variables.
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables.
const mainColor = '#0F0F0F';
const fireworksArr = [];
const particlesArr = [];
let fireworkLoop;
let loop = false;

context.fillStyle = mainColor;

// Events.
window.addEventListener('resize', resizeCanvas);

class Firework {
    constructor(posX, posY, color, radius, dx, dy, gravity) {
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.gravity = gravity;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
    }

    update() {
        this.posY += this.dy;
        this.posX += this.dx;
        this.dy += this.gravity;
    }

    drawFirework() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}

class Particle {
    constructor(posX, posY, color, radius, angle, speed) {
        this.speed = speed;
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.angle = angle;
        this.gravity = 0.1;
        this.friction = 0.95;
        this.dx = this.speed * Math.cos(angle * Math.PI / 180);
        this.dy = this.speed * Math.sin(angle * Math.PI / 180);
        this.color = color;
    }

    update() {
        this.posY += this.dy;
        this.posX += this.dx;

        this.dy *= this.friction;
        this.dx *= this.friction;
        this.gravity *= this.friction;

        this.dy += this.gravity;
    }

    drawParticle() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}

// Functions.

// Resizes the canvas when user resizes their browser window.
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function shootFirework(dirX, dirY) {
    const rocketSize = 2;
    const initPosX = getRand(canvas.width / 4, canvas.width / 2 + canvas.width / 4);
    const initPosY = canvas.height - rocketSize;
    const gravity = 0.15;
    const maxHeight = (canvas.height - dirY) * 2;
    dirX -= initPosX;
    const angle = Math.atan2(maxHeight, dirX);
    
    const v0 = Math.sqrt((gravity * dirX * 2) / (Math.sin(2 * angle)));
    const dY = -v0 * Math.sin(angle);
    const dX = v0 * Math.cos(angle);

    const rocket = new Firework(initPosX, initPosY, randomColor(), rocketSize, dX, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: canvas.height - maxHeight / 2, deleteTimeout: false});
}

function randomFirework() {
    const rocketSize = 2;
    const initPosX = getRand(50, canvas.width - 50);
    const initPosY = canvas.height - rocketSize;
    const gravity = 0.15;
    const maxHeight = getRand(400, canvas.height - 50);
    
    const dY = -Math.sqrt(2 * gravity * maxHeight);

    const rocket = new Firework(initPosX, initPosY, randomColor(), rocketSize, 0, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: canvas.height - maxHeight, deleteTimeout: false});
}

function startLoop() {
    if (loop === true) return;
    loop = true;
    fireworkLoop = setInterval(() => {
        randomFirework();
    }, getRand(300, 500));
}

function endLoop() {
    if (loop === false) return;
    loop = false;
    clearInterval(fireworkLoop);
}

function getRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function randomColor() {
    const colorArr = [
        '#ff1100', // Red.
        '#ff9100', // Orange.
        '#fff700', // Yellow.
        '#40ff00', // Green.
        '#00b3ff', // Light Blue.
        '#0022ff', // Blue.
        '#bd00b6', // Purple.
        '#ff59f1', // Pink.
        '#c2c2c2', // Silver.
        '#ffffff', // White
    ];

    return colorArr[getRand(0, colorArr.length - 1)];
}

function explodeFirework(xPos, yPos, color) {
    const particles = getRand(25, 40);

    for (let particle = 0; particle < particles; particle++) {
        const angle = particle / particles * 360;
        const sparkParticle = new Particle(xPos, yPos, color, 1.5, angle, getRand(5, 10));
        particlesArr.push(sparkParticle);
    }
}

function fireworksBurst(fireworks) {
    if (fireworks > 200) {
        fireworks = 200;
    } else if (fireworks < 1) {
        fireworks = 1;
    }

    for (let i = 0; i < Math.round(fireworks); i++) {
        randomFirework();
    }
}

// Main animation function
function animate() {
    // Slowly fade out the drawn rockets over time (Each iteration of the animation loop).
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = `rgba(15, 15, 15, 0.1)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "lighter";

    for (let firework = 0; firework < fireworksArr.length; firework++) {
        fireworksArr[firework].rocket.update();
        fireworksArr[firework].rocket.drawFirework();

        if (fireworksArr[firework].rocket.posY <= fireworksArr[firework].maxHeight) {
            explodeFirework(fireworksArr[firework].rocket.posX, fireworksArr[firework].rocket.posY, fireworksArr[firework].rocket.color);
            fireworksArr.splice(firework, 1);
        }
    }

    for (let particle = 0; particle < particlesArr.length; particle++) {
        particlesArr[particle].update();
        particlesArr[particle].drawParticle();

        const newRadius = particlesArr[particle].radius -= 0.022;
        if (newRadius <= 0) {
            particlesArr[particle].radius = 0;
            particlesArr.splice(particle, 1);
        } else {
            particlesArr[particle].radius = newRadius;
        }
    }

    // Update the rockets position over time.
    requestAnimationFrame(animate);
}


animate();