import { Snowflake } from "../classes/Snowflake";
import { getRand, resizeCanvas } from "./util";

// Snow
const snowCanvas = document.querySelector('.snow-canvas') as HTMLCanvasElement;
const snowCtx = snowCanvas.getContext('2d') as CanvasRenderingContext2D;
const currentMonth = new Date().getMonth() + 1;
snowCanvas.width = window.innerWidth;
snowCanvas.height = window.innerHeight;

let snowParticlesArr: Snowflake[] = [];
let lastSnowflake = Date.now();
let snowflakeCooldown = getRand(1000, 5000);

const interval = 1000 / 60;
let then = Date.now();
let now;
let delta;
let loop = true;

// Events
window.addEventListener('resize', () => resizeCanvas(snowCanvas));
document.addEventListener('visibilitychange', handleVisibilityChange);

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        loop = true;
    } else {
        loop = false;
    }
}

const randomSnowflake = () => {
    const initPosY = -5;
    const initPosX = getRand(-5, snowCanvas.width);
    const randRadius = getRand(1, 4);
    const randomOpaciy = Math.random() * 0.9;

    const snowflake = new Snowflake(initPosX, initPosY, `rgba(255, 255, 255, ${randomOpaciy})`, randRadius, 1, 100);

    snowParticlesArr.push(snowflake);
}

// Main animation function
const animate = () => {
    requestAnimationFrame(animate);

    now = Date.now();
    delta = now - then;

    if (delta < interval || !loop) return;

    // Clear the snow canvas.
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    // Draw snowflakes every 2-10 seconds.
    if ((now - lastSnowflake >= snowflakeCooldown) && (currentMonth >= 11 || currentMonth <= 1)) {
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
