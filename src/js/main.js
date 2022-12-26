// Document variables.
const d = document.querySelector(".days");
const h = document.querySelector(".hours");
const m = document.querySelector(".minutes");
const s = document.querySelector(".seconds");
const info = document.querySelector(".info");

// Variables.

// Functions.
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

function animateSeconds() {
    s.style = `transform: scale(1.3)`;

    setTimeout(() => {
        s.style = `transform: scale(1)`;
    }, 400);
}

function calculateTimeRemaining(startTime, endTime) {
    const timeRemaining = (endTime - startTime) / 1000;
    if (timeRemaining <= 10) {
        animateSeconds();
    }

    d.textContent = Math.floor(timeRemaining / 86400);
    h.textContent = Math.floor(timeRemaining / 3600 % 24) ;
    m.textContent = Math.floor(timeRemaining / 60 % 60);
    s.textContent = Math.floor(timeRemaining % 60);
}

// Main.
(function () {
    const currentTime = new Date();
    const newYear = new Date(currentTime.getFullYear() + 1, 0, 1);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1].replace("_", " ");
    info.textContent = `Time until ${getDayString(newYear.getDay())}, ${getMonthString(newYear.getMonth())} ${newYear.getDate()}, ${newYear.getFullYear()} (${timeZone} Time)`;

    calculateTimeRemaining(currentTime, newYear);
    const countdown = setInterval(() => {
        const start = new Date().getTime();
        calculateTimeRemaining(start, newYear);
    }, 1000);
})();