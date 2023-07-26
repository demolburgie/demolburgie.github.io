const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],

    }
  });
const { networkInterfaces } = require('os');
const N_CODES_START = 5;
const nets = networkInterfaces();
const results = {};
const CENT_PER_CLICK = 1
let codes = require("./getCodes.js")()

let door_status = {
    status: "not_started",
    unlocked_room: null,
    unlock_time: null,
}

let code_status = {
    room1: 5,
    room2: 5,
    room3: 5,
}

let flappy_status = {
    next_reward_time: null,
    room1: 0,
    room1_time: new Date(0),
    room2: 0,
    room2_time: new Date(1),
    room3: 0,
    room3_time: new Date(2),
    noob: 10,
    noob_time: new Date(0),
}

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(results)

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
  
rl.question('chose HOST_IP?', host_ip => {
    host_ip = "192.168.1.61"
    app.get('/', (req, res) => {
        res.sendFile('./escape_room/escape_room.html', {root: __dirname.slice(0, __dirname.length-6) + "website/"});
    });
    
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.emit("update_door_status", door_status)
        socket.emit("update_flappy_status", flappy_status)

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on("get_code_status", (room_id) => {
            socket.emit("update_code_status", code_status[room_id])
        })

        socket.on('unlock_room', (room_id) => {
            console.log(`Room ${room_id} pressed the button`);
            let date = new Date();
            // check in-time
            if (door_status.unlock_time != null && door_status.unlock_time.getTime() - date.getTime() < -500) {
                console.log(`room ${room_id} was to late`)
                socket.emit("to_late");
                return
            }
            // check codes available
            if (code_status[room_id] <= 0) {
                console.log(`room ${room_id} has no codes left`)
                socket.emit("no_codes_left")
                return
            }
            code_status[room_id] -= 1
            door_status.unlocked_room = room_id
            date.setMinutes(date.getMinutes() + 1)
            date.setMilliseconds(date.getMilliseconds() + 500)
            door_status.unlock_time = date
            console.log(door_status)
            socket.emit("update_code_status", code_status[room_id])
            io.emit("update_door_status", door_status);
        });

        socket.on('submit_code', (data) => {
            let date = new Date();
            if (door_status.unlock_time != null && door_status.unlock_time.getTime() - date.getTime() < -500) {
                console.log(`room ${data.room_id} entered code to late`)
                socket.emit("to_late");
                return
            }
            let code_check = codes.checkCode(data.code, data.room_id, CENT_PER_CLICK)
            console.log(`Room ${data.room_id} submitted code ${data.code}: ${code_check.message} [${code_check.n_clicks} clicks]`)
            code_status[data.room_id] = Math.max(0, code_status[data.room_id] + code_check.n_clicks)
            socket.emit("message", code_check.message)
            socket.emit("update_code_status", code_status[data.room_id])
        })

        socket.on("flappy", (data) => {
            if (data.score <= flappy_status[data.room_id]) {
                return 
            }
            flappy_status[data.room_id] = data.score
            flappy_status[data.room_id+"_time"] = new Date()
            io.emit("update_flappy_status",  flappy_status)
        })
    });
    
    server.listen(3000, host_ip, () => {
        console.log('listening on *:3000');
    });
});

function startFlappyTimer(period_in_min, start=false) {
    if (!start) {
        let players = ["room1", "room2", "room3", "noob"]
        players = players.sort((a, b) => {
            let time_diff = flappy_status[a+"_time"].getTime() - flappy_status[b+"_time"].getTime() > 0 ? 0.1 : -0.1
            console.log(flappy_status[a]+time_diff)
            return flappy_status[b] - (flappy_status[a]-time_diff)
        })
        let winner = players[0];
        if (winner == "noob") {
            io.emit("flappy_message", `You are all flappy bird noobs. No reward.`)
        } else {
            io.emit("flappy_message", `${winner} won 2 click and €0.${(CENT_PER_CLICK_PER_CLICK*2 >= 10 ? "" : "0") + CENT_PER_CLICK_PER_CLICK*2} with flappy bird.`)
            code_status[winner] += 2
        }
    }
    let date = new Date();
    date.setMinutes(date.getMinutes() + period_in_min)
    flappy_status.next_reward_time = date
    console.log(flappy_status)
    io.emit("update_flappy_status", flappy_status)
    setTimeout(() => startFlappyTimer(period_in_min), 1000*60*period_in_min)
}


rl.on('line', (line) => {
    if (line == "start") {
        console.log(`Game started`);
        door_status.status = "started"
        startFlappyTimer(1, true)
        io.emit("update_door_status", door_status)
        rl.close();
    }
});