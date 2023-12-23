// Fireworks
const fireworkCanvas = document.querySelector('.firework-canvas');
const fireworkCtx = fireworkCanvas.getContext('2d');
fireworkCanvas.width = window.innerWidth;
fireworkCanvas.height = window.innerHeight;

// Snow
const snowCanvas = document.querySelector('.snow-canvas');
const snowCtx = snowCanvas.getContext('2d');
snowCanvas.width = window.innerWidth;
snowCanvas.height = window.innerHeight;

const interval = 1000 / 60;
let then = Date.now();
let now;
let delta;

// Variables.
const mainColor = '#0F0F0F';
const currentMonth = new Date().getMonth();

let fireworksArr = [];
let particlesArr = [];
let snowParticlesArr = [];
let fireworkLoop;
let loop = false;
let lastSnowflake = Date.now();
let snowflakeCooldown = getRand(1000, 5000);

fireworkCtx.fillStyle = mainColor;

// Events.
window.addEventListener('resize', resizeCanvas);
window.addEventListener('click', (e) => {shootFirework(e.clientX, e.clientY)});

// Functions.

// Resizes the canvas when user resizes their browser window.
function resizeCanvas() {
    fireworkCanvas.width = window.innerWidth;
    fireworkCanvas.height = window.innerHeight;

    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
}

function shootFirework(dirX, dirY) {
    const rocketSize = 2;
    const initPosX = getRand(fireworkCanvas.width / 4, fireworkCanvas.width / 2 + fireworkCanvas.width / 4);
    const initPosY = fireworkCanvas.height - rocketSize;
    const gravity = 0.15;
    const maxHeight = (fireworkCanvas.height - dirY) * 2;
    dirX -= initPosX;
    const angle = Math.atan2(maxHeight, dirX);
    
    const v0 = Math.sqrt((gravity * dirX * 2) / (Math.sin(2 * angle)));
    const dY = -v0 * Math.sin(angle);
    const dX = v0 * Math.cos(angle);

    const rocket = new Firework(initPosX, initPosY, randomColor(), rocketSize, dX, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: fireworkCanvas.height - maxHeight / 2, deleteTimeout: false});
}

function randomFirework() {
    const rocketSize = 2;
    const initPosX = getRand(50, fireworkCanvas.width - 50);
    const initPosY = fireworkCanvas.height - rocketSize;
    const gravity = 0.15;
    const maxHeight = getRand(400, fireworkCanvas.height - 50);
    
    const dY = -Math.sqrt(2 * gravity * maxHeight);

    const rocket = new Firework(initPosX, initPosY, randomColor(), rocketSize, 0, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: fireworkCanvas.height - maxHeight, deleteTimeout: false});
}

function randomSnowflake() {
    const initPosY = -5;
    const initPosX = getRand(-5, fireworkCanvas.width);
    const randRadius = getRand(1, 4);
    const randomOpaciy = Math.random() * 0.9;

    const snowflake = new Snowflake(initPosX, initPosY, `rgba(255, 255, 255, ${randomOpaciy})`, randRadius, 1, 100);

    snowParticlesArr.push(snowflake);
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
        const sparkParticle = new FireworkParticle(xPos, yPos, color, 1.5, angle, getRand(5, 10));
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
    // Update the rockets position over time.
    requestAnimationFrame(animate);

    now = Date.now();
    delta = now - then;

    if (delta < interval) return;

    // Slowly fade out the drawn rockets over time (Each iteration of the animation loop for the fireworks canvas).
    fireworkCtx.globalCompositeOperation = 'source-over';
    fireworkCtx.fillStyle = `rgba(15, 15, 15, 0.2)`;
    fireworkCtx.fillRect(0, 0, fireworkCanvas.width, fireworkCanvas.height);
    fireworkCtx.globalCompositeOperation = "lighter";

    // Clear the snow canvas.
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    // Draw the rockes.
    for (let firework = fireworksArr.length - 1; firework >= 0; firework--) {
        fireworksArr[firework].rocket.update();
        fireworksArr[firework].rocket.draw(fireworkCtx);

        if (fireworksArr[firework].rocket.posY <= fireworksArr[firework].maxHeight) {
            explodeFirework(fireworksArr[firework].rocket.posX, fireworksArr[firework].rocket.posY, fireworksArr[firework].rocket.color);
            fireworksArr.splice(firework, 1);
        }
    }

    // Draw the firework particles on explosion.
    for (let particle = particlesArr.length - 1; particle >= 0; particle--) {
        particlesArr[particle].update();
        particlesArr[particle].draw(fireworkCtx);

        const newRadius = particlesArr[particle].radius -= 0.022;
        if (newRadius <= 0) {
            particlesArr[particle].radius = 0;
            particlesArr.splice(particle, 1);
        } else {
            particlesArr[particle].radius = newRadius;
        }
    }

    // -------------------------- Handle snowflakes --------------------------------

    // Draw snowflakes every 2-10 seconds.
    if ((now - lastSnowflake >= snowflakeCooldown) && (currentMonth === 11 || currentMonth === 0)) {
        randomSnowflake();
        lastSnowflake = Date.now();
        snowflakeCooldown = getRand(200, 800);
    }

    // Draw the snow particles.
    for (let snowflake = snowParticlesArr.length - 1; snowflake >= 0; snowflake--) {
        snowParticlesArr[snowflake].update();
        snowParticlesArr[snowflake].draw(snowCtx);

        // Remove the particles once it reaches the bottom of the screen.
        if (snowParticlesArr[snowflake].posY > snowCanvas.height) {
            snowParticlesArr.splice(snowflake, 1);
        }
    }

    then = now - (delta % interval);
}

animate();