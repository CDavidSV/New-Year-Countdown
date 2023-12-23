// Document variables.
const d = document.querySelector(".days");
const h = document.querySelector(".hours");
const m = document.querySelector(".minutes");
const s = document.querySelector(".seconds");
const info = document.querySelector(".info");
const infoCont = document.querySelector(".information-container");
const title = document.querySelector(".title");
const countdownContainer = document.querySelector(".countdown-container");

// Variables.
let countdown;
let isNewYear = false;

// Events.
document.addEventListener('visibilitychange', handleVisibilityChange);

// Functions.

// Returns the corresponding day of the wekk given a number from 0 to 6.
function getDayString(day) {
    if (day > 6 || day < 0) return;

    const weekDays = {
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
function getMonthString(month) {
    if (month > 11 || month < 0) return

    const months = {
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
function animateSeconds() {
    s.style = `transform: scale(1.3)`;

    setTimeout(() => {
        s.style = `transform: scale(1)`;
    }, 400);
}

// FUnction called every second to calculate the time remaining till the end timestamp.
function calculateTimeRemaining(startTime, endTime) {
    const timeRemaining = (endTime - startTime) / 1000;
    
    if (Math.floor(timeRemaining) <= 10) {
        animateSeconds();
    }

    if (Math.floor(timeRemaining) <= 0) {
        setNewyearText();
        fireworksBurst(20);
        isNewYear = true;
        setTimeout(startLoop, 1000); // Happy New Year.
        clearInterval(countdown);
    }

    d.textContent = Math.floor(timeRemaining / 86400);
    h.textContent = Math.floor(timeRemaining / 3600 % 24) ;
    m.textContent = Math.floor(timeRemaining / 60 % 60);
    s.textContent = Math.floor(timeRemaining % 60);
}

function handleVisibilityChange() {
    if (document.visibilityState == "visible" && isNewYear) {
        startLoop();
    } else {
        endLoop();
    }
}

function setNewyearText() {
    infoCont.style.background = "none";
    title.innerHTML = "";
    info.innerHTML = "";
    countdownContainer.innerHTML = "<div class=\"new-year\"><p>Happy New Year!</p></div>";
    countdownContainer.style.background = 'none';
    setTimeout(() => {document.querySelector(".new-year").style = 'transform: scale(1);'},100);
}

// Main.
(function () {
    const currentTime = new Date();
    const newYear = new Date(currentTime.getFullYear() + 1, 0, 1);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1].replace("_", " ");
    info.textContent = `Time until ${getDayString(newYear.getDay())}, ${getMonthString(newYear.getMonth())} ${newYear.getDate()}, ${newYear.getFullYear()} (${timeZone} Time)`;
    
    if (currentTime.getMonth() == 0 && currentTime.getDate() == 1) {
        isNewYear = true;
        setNewyearText();
        startLoop();
        return;
    }

    calculateTimeRemaining(currentTime, newYear);
    countdown = setInterval(() => {
        const start = new Date().getTime();
        calculateTimeRemaining(start, newYear);
    }, 1000);
})();