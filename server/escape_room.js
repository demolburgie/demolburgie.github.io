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

const nets = networkInterfaces();
const results = {};

let door_status = {
    status: "not_started",
    unlocked_room: null,
    unlock_time: null,
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
    host_ip = "192.168.0.253"
    app.get('/', (req, res) => {
        res.sendFile('./escape_room/escape_room.html', {root: __dirname.slice(0, __dirname.length-6) + "website/"});
    });
    
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.emit("update_door_status", door_status)

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('unlock_room', (room_id) => {
            console.log(`Room ${room_id} pressed the button`);
            door_status.unlocked_room = room_id
            let date = new Date();
            date.setMinutes(date.getMinutes() + 1)
            date.setSeconds(date.getSeconds() + 1)
            door_status.unlock_time = date
            console.log(door_status)
            io.emit("update_door_status", door_status);
          });
    });
    
    server.listen(3000, host_ip, () => {
        console.log('listening on *:3000');
    });
});


rl.on('line', (line) => {
    if (line == "start") {
        console.log(`Game started`);
        door_status.status = "started"
        io.emit("update_door_status", door_status)
        rl.close();
    }
});