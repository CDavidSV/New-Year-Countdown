import './style.css';
import { fireworksBurst, startLoop, endLoop } from './scripts/canvasController';

const d = document.querySelector(".days") as HTMLElement;
const h = document.querySelector(".hours") as HTMLElement;
const m = document.querySelector(".minutes") as HTMLElement;
const s = document.querySelector(".seconds") as HTMLElement;
const info = document.querySelector(".info") as HTMLElement;
const infoCont = document.querySelector(".information-container") as HTMLElement;
const title = document.querySelector(".title") as HTMLElement;
const countdownContainer = document.querySelector(".countdown-container") as HTMLElement;

let countdown: number;

// Returns the corresponding day of the wekk given a number from 0 to 6.
const getDayString = (day: number) => {
    if (day > 6 || day < 0) return;

    const weekDays: { [key: number]: string } = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    };

    return weekDays[day];
}

// Returns the corresponding month to a 0 indexed number.
const getMonthString = (month: number) => {
    if (month > 11 || month < 0) return

    const months: { [key: number]: string } = {
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December"
    };

    return months[month];
}

// Animates the seconds counter (Called when 10 seconds or less are remaining in the countdown).
const animateSeconds = () => {
    s.style.setProperty('transform', 'scale(1.3)');

    setTimeout(() => {
      s.style.setProperty('transform', 'scale(1)');
    }, 400);
}

// FUnction called every second to calculate the time remaining till the end timestamp.
const calculateTimeRemaining = (startTime: number, endTime: number) => {
    const timeRemaining = (endTime - startTime) / 1000;

    if (Math.floor(timeRemaining) <= 10) {
        animateSeconds();
    }

    if (Math.floor(timeRemaining) <= 0) {
        setNewyearText();
        fireworksBurst(20);
        endLoop();
        setTimeout(startLoop, 1000); // Happy New Year.
        clearInterval(countdown);
    }

    d.textContent = Math.floor(timeRemaining / 86400).toString();
    h.textContent = Math.floor(timeRemaining / 3600 % 24).toString();
    m.textContent = Math.floor(timeRemaining / 60 % 60).toString();
    s.textContent = Math.floor(timeRemaining % 60).toString();
}

const setNewyearText = () => {
    infoCont.style.background = "none";
    title.innerHTML = "";
    info.innerHTML = "";
    countdownContainer.innerHTML = "<div class=\"new-year\"><p>Happy New Year!</p></div>";
    countdownContainer.style.background = 'none';
    setTimeout(() => {(document.querySelector(".new-year") as HTMLElement).style.setProperty('transform', 'scale(1)')}, 100);
}

// Main.
(() => {
    const currentTime = new Date();
    const newYear = new Date(currentTime.getFullYear() + 1, 0, 1);

    // If the current date is close to the new year
    if (currentTime.getMonth() == 11 && currentTime.getDate() >= 28) {
        startLoop(3000, 5000);
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1].replace("_", " ");
    info.textContent = `Time until ${getDayString(newYear.getDay())}, ${getMonthString(newYear.getMonth())} ${newYear.getDate()}, ${newYear.getFullYear()} (${timeZone} Time)`;

    // Check if it's new year and start the loop.
    if (currentTime.getMonth() == 0 && currentTime.getDate() == 1) {
        setNewyearText();
        startLoop();
        return;
    }

    // Calculate remaining time
    calculateTimeRemaining(currentTime.getTime(), newYear.getTime());
    countdown = setInterval(() => {
        const start = new Date().getTime();
        calculateTimeRemaining(start, newYear.getTime());
    }, 1000);
})();
