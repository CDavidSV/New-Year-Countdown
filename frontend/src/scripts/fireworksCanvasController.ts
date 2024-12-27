import { Firework } from '../classes/Firework';
import { FireworkParticle } from '../classes/FireworkParticle';
import { getRand, randomColor, resizeCanvas } from './util';
import { FireworkMessage, WebsocketHandler } from './websocketHandler';

// Fireworks
const fireworkCanvas = document.querySelector('.firework-canvas') as HTMLCanvasElement;
const fireworkCtx = fireworkCanvas.getContext('2d') as CanvasRenderingContext2D;
fireworkCanvas.width = window.innerWidth;
fireworkCanvas.height = window.innerHeight;

const interval = 1000 / 60;
let then = Date.now();
let now;
let delta;

const mainColor = '#0F0F0F';
const wsHandler = new WebsocketHandler((message: FireworkMessage) => {
    // First check if the user is viewing the page.
    if (document.visibilityState !== 'visible') return;

    const canvasSize = getCanvasSize();

    message.initX = canvasSize.width * message.initX / message.screenWidth;
    message.initY = canvasSize.height * message.initY / message.screenHeight;
    message.endX = canvasSize.width * message.endX / message.screenWidth;
    message.endY = canvasSize.height * message.endY / message.screenHeight;

    shootFirework(message)
});

let fireworksArr: { rocket: Firework, maxHeight: number, deleteTimeout: boolean}[] = [];
let particlesArr: FireworkParticle[] = [];
let fireworkLoop: number;
let loop = false;
let active = false;

fireworkCtx.fillStyle = mainColor;

// Events.
window.addEventListener('resize', () => resizeCanvas(fireworkCanvas));
window.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) return;

    const newFireworkOptions = shootFirework({ endX: e.clientX, endY: e.clientY });

    // send ws message
    wsHandler.sendMessage({
        screenWidth: fireworkCanvas.width,
        screenHeight: fireworkCanvas.height,
        initX: newFireworkOptions.initX,
        initY: newFireworkOptions.initY,
        endX: newFireworkOptions.endX,
        endY: newFireworkOptions.endY,
        color: newFireworkOptions.color,
    } as FireworkMessage);
});
document.addEventListener('visibilitychange', handleVisibilityChange);

interface NewFireworkOptions {
    endX: number;
    endY: number;
    initX?: number;
    initY?: number;
    color?: string;
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && active) {
        loop = true;
    } else {
        loop = false;
    }
}

export const shootFirework = (options: NewFireworkOptions): NewFireworkOptions => {
    const rocketSize = 2;

    if (!options.initX || !options.initY) {
        options.initX = getRand(fireworkCanvas.width / 4, fireworkCanvas.width / 2 + fireworkCanvas.width / 4);
        options.initY = fireworkCanvas.height - rocketSize;
    }

    const gravity = 0.15;
    const maxHeight = (fireworkCanvas.height - options.endY) * 2;
    const angle = Math.atan2(maxHeight, options.endX - options.initX);
    options.color = options.color ? options.color : randomColor();

    const v0 = Math.sqrt((gravity * (options.endX - options.initX) * 2) / (Math.sin(2 * angle)));
    const dY = -v0 * Math.sin(angle);
    const dX = v0 * Math.cos(angle);

    const rocket = new Firework(options.initX, options.initY, options.color, rocketSize, dX, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: fireworkCanvas.height - maxHeight / 2, deleteTimeout: false});

    return options;
}

const randomFirework = () => {
    const rocketSize = 2;
    const initPosX = getRand(50, fireworkCanvas.width - 50);
    const initPosY = fireworkCanvas.height - rocketSize;
    const gravity = 0.15;
    const maxHeight = getRand(400, fireworkCanvas.height - 50);

    const dY = -Math.sqrt(2 * gravity * maxHeight);

    const rocket = new Firework(initPosX, initPosY, randomColor(), rocketSize, 0, dY, gravity);
    fireworksArr.push({rocket: rocket, maxHeight: fireworkCanvas.height - maxHeight, deleteTimeout: false});
}

export const startLoop = (customStart: number = 300, customEnd: number = 500) => {
    if (loop === true) return;
    loop = true;
    active = true;

    handleVisibilityChange();
    fireworkLoop = setInterval(() => {
        if (loop === false) return;
        randomFirework();
    }, getRand(customStart, customEnd));
}

export const endLoop = () => {
    if (loop === false) return;
    loop = false;
    active = false;
    clearInterval(fireworkLoop);
}

const explodeFirework = (xPos: number, yPos: number, color: string) => {
    const particles = getRand(25, 40);

    for (let particle = 0; particle < particles; particle++) {
        const angle = particle / particles * 360;
        const sparkParticle = new FireworkParticle(xPos, yPos, color, 1.5, angle, getRand(5, 10));
        particlesArr.push(sparkParticle);
    }
}

export const fireworksBurst = (fireworks: number) => {
    if (fireworks > 200) {
        fireworks = 200;
    } else if (fireworks < 1) {
        fireworks = 1;
    }

    for (let i = 0; i < Math.round(fireworks); i++) {
        randomFirework();
    }
}

export const getCanvasSize = (): { width: number, height: number } => {
    return { width: fireworkCanvas.width, height: fireworkCanvas.height };
}

// Main animation function
const animate = () => {
    // Update the rockets position over time.
    requestAnimationFrame(animate);

    now = Date.now();
    delta = now - then;

    if (delta < interval) return;

    // Slowly fade out the drawn rockets over time (Each iteration of the animation loop for the fireworks canvas).
    fireworkCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    fireworkCtx.fillRect(0, 0, fireworkCanvas.width, fireworkCanvas.height);

    // Draw the rockets.
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

    then = now - (delta % interval);
}

animate();
