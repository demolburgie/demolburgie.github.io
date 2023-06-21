"use strict"

let room_id = sessionStorage.getItem("room_id")

let door_status = {
    status: null,
    unlocked_room: null,
    unlock_time: null
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

if (room_id == null) {
    room_id = prompt("Room id:").toString()
    sessionStorage.setItem("room_id", room_id)
}
console.log(room_id) 

const text_closed = "Een andere kamerdeur opent over"
const text_open = "Jullie kamerdeur opent over"

function lockOtherRoom() {
    socket.emit('unlock_room', room_id);
}

function updateDoorStatus(new_door_status) {
    console.log(new_door_status)
    door_status.status = new_door_status.status
    door_status.unlocked_room = new_door_status.unlocked_room
    door_status.unlock_time = new Date(Date.parse(new_door_status.unlock_time))
    render()
}

function render() {
    if (door_status.status == "not_started") {
        document.getElementById("main-info").hidden = true
        document.getElementById("lock-button").hidden = true
        document.body.style.backgroundImage = "url(./assets/background_neutral.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room == null) {
        document.getElementById("main-info").hidden = true
        document.getElementById("lock-button").hidden = false
        document.body.style.backgroundImage = "url(./assets/background_neutral.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room == room_id) { // Open
        document.getElementById("main-info").hidden = false
        document.getElementById("lock-button").hidden = false
        document.querySelector("#main-info > p").textContent = text_open
        document.body.style.backgroundImage = "url(./assets/background_open.png)"
        
    } else if (door_status.status == "started" && door_status.unlocked_room != room_id) { // closed
        document.getElementById("main-info").hidden = false
        document.getElementById("lock-button").hidden = false
        document.querySelector("#main-info > p").textContent = text_closed
        document.body.style.backgroundImage = "url(./assets/background_closed.png)"
        
    }
}


// let socket = io("http://192.168.0.253:3000/");
let socket = io("https://de-mol-escape-room.glitch.me");

socket.on("update_door_status", updateDoorStatus)


// ADD LISTENERS
// lock other door

document.getElementById('lock-button').addEventListener('click', lockOtherRoom);
document.addEventListener("keydown", (e) => {if (e.key == " ") {lockOtherRoom()}})

startTime()
render()