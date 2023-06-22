const peer = new Peer(
    `${window.room_id+"molburgie2023"}`,
    {
      debug: 1,
    }
  );

window.peer = peer

// Gives access to microphone
function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream; 
      window.localAudio.srcObject = stream; 
      window.localAudio.autoplay = true;
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}
getLocalStream();

// peer.on("open", () => {
//   window.caststatus.textContent = `Your device ID is: ${peer.id}`;
//   console.log(peer.id)
// });

// const audioContainer = document.querySelector(".call-container");

// Displays the call button and peer ID
// function showCallContent() {
//   window.caststatus.textContent = `Your device ID is: ${peer.id}`;
//   callBtn.hidden = false;
//   audioContainer.hidden = true;
// }


// let code;
// function getStreamCode() {
//   code = window.prompt("Please enter the sharing code");
// }

let conn;
// outgoing connection
function connectPeers(code) {
  conn = peer.connect(code);
  conn.on("close", () => {
    document.getElementById("call-busy").hidden = true;
    document.getElementById("requesting-call").hidden = true;
    document.getElementById("start-call").hidden = false;
    store_call.close()
  });
}

// incomming connection
peer.on("connection", (connection) => {
    console.log("on.connect")
    conn = connection;
    conn.on("close", () => {
        document.getElementById("call-busy").hidden = true;
        document.getElementById("requesting-call").hidden = true;
        document.getElementById("start-call").hidden = false;
        store_call.close()
      });
});

let store_call;

// add call function to buttons
// button 1
document.querySelector("#call1").addEventListener("click", () => {
    let code = document.querySelector("#call1").innerHTML+"molburgie2023"
    connectPeers(code);
    // set info
    document.getElementById("start-call").hidden = true;
    document.getElementById("requesting-call").hidden = false;
    document.getElementById("requesting-call").innerHTML = `Calling ${document.querySelector("#call1").innerHTML}...`
    store_call = peer.call(code, window.localStream); // A

    store_call.on("stream", (stream) => {
        window.remoteAudio.srcObject = stream;
        window.remoteAudio.autoplay = true; 
        window.peerStream = stream;
        // so hang up button
        document.getElementById("requesting-call").hidden = true;
        document.getElementById("call-busy").hidden = false;
    });
});
// button 2
document.querySelector("#call2").addEventListener("click", () => {
    let code = document.querySelector("#call2").innerHTML+"molburgie2023"
    connectPeers(code);
    // set info
    document.getElementById("start-call").hidden = true;
    document.getElementById("requesting-call").hidden = false;
    document.getElementById("requesting-call").innerHTML = `Calling ${document.querySelector("#call2").innerHTML}...`
    store_call = peer.call(code, window.localStream); // A

    store_call.on("stream", (stream) => {
        window.remoteAudio.srcObject = stream;
        window.remoteAudio.autoplay = true; 
        window.peerStream = stream;
        // so hang up button
        document.getElementById("requesting-call").hidden = true;
        document.getElementById("call-busy").hidden = false;
    });
});

// handle incoming call
peer.on("call", async (call) => {
    // set call answer buttons
    store_call = call
    // remove existing eventlisteners
    document.getElementById("accept-call").replaceWith(document.getElementById("accept-call").cloneNode(true));
    document.getElementById("deny-call").replaceWith(document.getElementById("deny-call").cloneNode(true));

    document.getElementById("start-call").hidden = true;
    document.getElementById("answer-call").hidden = false;
    document.getElementById("incoming-call-info").innerHTML = `Incoming call from ${call.peer.split("mol")[0]}`
    
    // create promise to wait for answer
    let resolve_promise
    let promise = new Promise((resolve, reject) => {
        resolve_promise = resolve;
        timeout = setTimeout(() => resolve(false), 10*1000)
    })
    document.getElementById("accept-call").addEventListener("click", () => resolve_promise(true))
    document.getElementById("deny-call").addEventListener("click", () => resolve_promise(false))
    
    let answerCall = await promise;
    if (answerCall) { // incomming call accepted
        console.log("accept call")
        call.answer(window.localStream);
        document.getElementById("answer-call").hidden = true;
        document.getElementById("call-busy").hidden = false;
        call.on("stream", (stream) => {
            window.remoteAudio.srcObject = stream;
            window.remoteAudio.autoplay = true;
            window.peerStream = stream;
        });
        call.on("close", () => {
            document.getElementById("call-busy").hidden = true;
            document.getElementById("start-call").hidden = false;
            store_call.close()
        });
    } else {
        conn.close()
        document.getElementById("answer-call").hidden = true;
        document.getElementById("start-call").hidden = false;
        console.log("call denied"); // D
    }
});
document.getElementById("stop-call").addEventListener("click", () => {
    console.log("closing connection..")
    conn.close()
    store_call.close()
    document.getElementById("call-busy").hidden = true;
    document.getElementById("start-call").hidden = false;

})




