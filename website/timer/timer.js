"use strict"

alert("Use arrows to adjust time.\n Press s to start, p to pause and r to reset.")

let input = {
    "hours": 2,
    "min": 0,
    "sec": 10,
    "repeat" : 1
}

let TIMERFIELDS = ["hours", "min", "sec"]
let edit_idx = 0 

let sound = document.getElementById("sound");

let settings = {"hours": input.hours, "min": input.min, "sec": input.sec, "repeat": input.repeat};

let busy = false;
let pause = false;


let hour = document.getElementById("hour");
let min = document.getElementById("min");
let sec = document.getElementById("sec");
let timer;
settingsToPage(settings);

function settingsToPage(settings) {
    if (!busy) {
        hour.innerHTML = settings.hours > 9 ? settings.hours : "0" + settings.hours;     
        document.getElementById('hour-:').innerHTML = ":"
        min.innerHTML = settings.min > 9 ? settings.min : "0" + settings.min;
        document.getElementById('min-:').innerHTML = ":"
        sec.innerHTML = settings.sec > 9 ? settings.sec : "0" + settings.sec;
    } else {
        if (settings.hours > 0) {
            hour.innerHTML = settings.hours;   
            document.getElementById('hour-:').innerHTML = ":"
        } else {
            hour.innerHTML = "";   
            document.getElementById('hour-:').innerHTML = ""
        }
        if (settings.hours > 0 || settings.min > 0) {
            if (settings.hours > 0) {
                min.innerHTML = settings.min > 9 ? settings.min : "0" + settings.min;   
            } else {
                min.innerHTML = settings.min;   
            }
            document.getElementById('min-:').innerHTML = ":"
        } else {
            min.innerHTML = "";   
            document.getElementById('min-:').innerHTML = ""
        }
        if (settings.hours > 0 || settings.min > 0) {
            sec.innerHTML = settings.sec > 9 ? settings.sec : "0" + settings.sec;   
        } else {
            sec.innerHTML = settings.sec;   
        }
    }
}

document.addEventListener("keydown", (event) => {
    if (!busy && event.key == "ArrowDown") {
        settings[TIMERFIELDS[edit_idx]] = Math.min(Math.max(settings[TIMERFIELDS[edit_idx]] - 1, 0), 59)
        settingsToPage(settings);
    }
    if (!busy && event.key == "ArrowUp") {
        settings[TIMERFIELDS[edit_idx]] = Math.min(Math.max(settings[TIMERFIELDS[edit_idx]] + 1, 0), 59)
        settingsToPage(settings);
    }
    if (!busy && event.key == "ArrowLeft") {
        edit_idx = Math.min(Math.max(edit_idx-1, 0), 2)
        settingsToPage(settings);
    }
    if (!busy && event.key == "ArrowRight") {
        edit_idx = Math.min(Math.max(edit_idx+1, 0), 2)
        settingsToPage(settings);
    }
    if (event.key == "s" && !busy) { // start
        timer = setInterval(timeDown, 1000);
        busy = true;
    }
    if (event.key == "p") { // pause
        pause = !pause;
    }

    if (event.key == "r") { // reset
        pause = false;
        busy = false;
        clearInterval(timer)
        settings = {"hours": input.hours, "min": input.min, "sec": input.sec, "repeat": input.repeat};
        settingsToPage(settings);
    }
})

function timeDown() {
    if (!busy || pause) return;
    if (settings.hours == 0 && settings.min == 0 && settings.sec == 0) {
        if (settings.repeat != 1) {
            settingsToPage(input);
            settings.hours = input.hours;
            settings.min = input.min;
            settings.sec = input.sec;
            settings.repeat--;
        }
        else {
            busy = false;
        }
        return;
    }
    else {
        settings.sec--;
        if (settings.sec == -1) {
            settings.min--;
            settings.sec = 59;
        }
        if (settings.min == -1) {
            settings.hours--;
            settings.min = 59;
        }
        if (settings.hours == -1) {
            settings.hours == 0;
            settings.min == 0;
            settings.sec == 0;
            
        }
        if (settings.hours == 0 && settings.min == 0 && settings.sec == 0) {
            sound.play();
            setTimeout(() => {sound.pause();sound.load()}, 3000);
        }
        settingsToPage(settings);   

    }
}