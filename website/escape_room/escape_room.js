"use strict"

let room_id = sessionStorage.getItem("room_id")

let door_status = {
    status: null,
    unlocked_room: null,
    unlock_time: null
}

let flappy_status = {
    next_reward_time: null,
    room1: 0,
    room2: 0,
    room3: 0,
    noob: 10,
}

window.flappy_status = flappy_status

let n_clicks = 10;
let audio_playing = false;



function showMorse(morse, idx=0) {
    let node = document.getElementById("morse")
    node.style.opacity = 0.0
    setTimeout(() => node.style.opacity = 1.0, 250)
    setTimeout(() => showMorse(morse, (idx+1)%(morse.length)), morse[idx] == "." ? 1000 : 2000)
}

function showDialog(message, time) {
    let dialog =  document.querySelector("dialog")
    dialog.innerHTML = message
    dialog.classList.add("popin")
    setTimeout(() => {
        dialog.classList.remove("popin")
    }, time)
}

function startTime() {
    let m, s
    if (door_status.unlock_time == null) {
        m = 1
        s = 0
    } else {
        const now = Date.now();
        let ms_diff = door_status.unlock_time.getTime() - now;
        m = Math.floor((ms_diff) / (1000*60));
        s = Math.floor(((ms_diff) % (1000*60)) / 1000);
        if (m < 0 || s < 0) {
            s = 0
            m = 0
        }
    }
    document.getElementById('min').innerHTML =  (m >= 10 ? "" : "0") + m;
    document.getElementById('sec').innerHTML =  (s >= 10 ? "" : "0") + s;
    setTimeout(startTime, 120);
}

function startFlappyTime() {
    let innerHTML = "Press 'F' for fly.";
    if (flappy_status.next_reward_time != null) {
        const now = Date.now();
        let ms_diff = flappy_status.next_reward_time.getTime() - now;
        let m = Math.floor((ms_diff) / (1000*60));
        let s = Math.floor(((ms_diff) % (1000*60)) / 1000);
        if (m < 0 || s < 0) {
            s = 0
            m = 0
        }
        innerHTML = innerHTML.concat(`<br>Next reward in ${(m >= 10 ? "" : "0")+m}:${(s >= 10 ? "" : "0")+s}`)
    }
    flappy_doc.querySelector("#InstructionBox > div").innerHTML = innerHTML
    setTimeout(startFlappyTime, 1000)  
}

if (room_id == null) {
    room_id = prompt("Room id (type room1, room2 or room3):").toString()
    sessionStorage.setItem("room_id", room_id)
}

const text_closed = "Een andere kamerdeur opent over"
const text_open = "Jullie kamerdeur opent over"

function sumbitCode() {
    let code = document.querySelector("#code-input input").value
    document.querySelector("#code-input input").value = ""
    socket.emit("submit_code", {room_id: room_id, code: code})
}

function lockOtherRoom() {
    if (audio_playing == false) {
        document.getElementById("audio").play();
        audio_playing = true;
    }
    socket.emit('unlock_room', room_id);
}

function updateDoorStatus(new_door_status) {
    door_status.status = new_door_status.status
    door_status.unlocked_room = new_door_status.unlocked_room
    door_status.unlock_time = new Date(Date.parse(new_door_status.unlock_time))
    render()
}

function updateCodeStatus(new_code_status) {
    n_clicks = new_code_status
    document.querySelector("#code-input p").innerHTML = n_clicks == 1 ? `Nog 1 resterende click` : `Nog ${n_clicks} resterende clicks`
}

function updateFlappyStatus(new_flappy_status) {
    flappy_status.room1 = new_flappy_status.room1
    flappy_status.room2 = new_flappy_status.room2
    flappy_status.room3 = new_flappy_status.room3
    flappy_status.noob = new_flappy_status.noob
    flappy_status.next_reward_time = new Date(Date.parse(new_flappy_status.next_reward_time))
    flappy_status.room1_time = new Date(Date.parse(new_flappy_status.room1_time))
    flappy_status.room2_time = new Date(Date.parse(new_flappy_status.room2_time))
    flappy_status.room3_time = new Date(Date.parse(new_flappy_status.room3_time))
    flappy_status.noob_time = new Date(Date.parse(new_flappy_status.noob_time))
    window.flappy_status = flappy_status
    let players = ["room1", "room2", "room3", "noob"]
    players = players.sort((a, b) => {
        let time_diff = flappy_status[a+"_time"].getTime() - flappy_status[b+"_time"].getTime() > 0 ? 0.1 : -0.1
        console.log(flappy_status[a]+time_diff)
        return flappy_status[b] - (flappy_status[a]-time_diff)
    })
    flappy_doc.querySelector("#leaderboard").innerHTML = "<span>Leaderboard</span>"

    for (let i=0; i<players.length; i++) {
        let child = flappy_doc.createElement("div")
        child.innerHTML = `${i+1}.&emsp;${players[i]}&emsp;&emsp;${flappy_status[players[i]]}`
        child.style.fontSize="4vh"
        flappy_doc.querySelector("#leaderboard").append(child)
    }
}

function render() {
    if (door_status.status == "not_started") {
        document.getElementById("main-info").hidden = true
        document.getElementById("lock-button").hidden = true
        document.querySelector("#code-input p").hidden = true
        document.querySelector("#code-input > div").hidden = true
        document.getElementById("flappy").hidden = true
        document.body.style.backgroundImage = "url(./assets/background_neutral.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room == null) {
        document.getElementById("main-info").hidden = true
        document.getElementById("lock-button").hidden = false
        document.querySelector("#code-input p").hidden = true
        document.querySelector("#code-input > div").hidden = true
        document.getElementById("flappy").hidden = true
        document.body.style.backgroundImage = "url(./assets/background_neutral.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room == room_id) { // Open
        document.getElementById("main-info").hidden = false
        document.getElementById("lock-button").hidden = false
        document.querySelector("#code-input p").hidden = false
        document.querySelector("#code-input > div").hidden = false
        document.querySelector("#main-info > p").textContent = text_open
        document.getElementById("flappy").hidden = false
        document.body.style.backgroundImage = "url(./assets/background_open.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room != room_id) { // closed
        document.getElementById("main-info").hidden = false
        document.getElementById("lock-button").hidden = false
        document.querySelector("#code-input p").hidden = false
        document.querySelector("#code-input > div").hidden = false
        document.getElementById("flappy").hidden = false
        document.querySelector("#main-info > p").textContent = text_closed
        document.body.style.backgroundImage = "url(./assets/background_closed.png)"
        
    }
}

window.updateHighscore = function(score) {
    console.log("score: ", score)
    socket.emit("flappy", {room_id: room_id, score, score})
}


// let socket = io("http://192.168.0.253:3000/");
let socket = io("https://de-mol-escape-room.glitch.me");

socket.on("update_door_status", updateDoorStatus)
socket.on("update_code_status", updateCodeStatus)
socket.on("update_flappy_status", updateFlappyStatus)
socket.on("to_late", () => showDialog("Te laat! De deur is reeds open.", 2000))
socket.on("no_codes_left", () => showDialog("U heeft geen clicks meer over. Geef eerst een nieuwe code in.", 2000))
socket.on("message", (data) => showDialog(data, 3000))
socket.on("flappy_message", (data) => {showDialog(data, 3000); socket.emit("get_code_status", room_id)})

// ADD LISTENERS
// lock other door

document.getElementById('lock-button').addEventListener('click', lockOtherRoom);
document.addEventListener("keydown", (e) => {if (e.key == " ") {lockOtherRoom()}})
document.querySelector("#code-input button").addEventListener('click', sumbitCode)

let flappy_doc = document.getElementById("flappy").contentDocument;

startTime()
startFlappyTime()
render()
showMorse("...___...")
socket.emit("get_code_status", room_id)