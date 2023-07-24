"use strict"
let start_num = parseFloat(prompt("Start value"))
let dec = parseFloat(prompt("decrement num with value"))
let interval = parseFloat(prompt("decrement with interval in ms"))
let num_of_decimals = parseInt(prompt("num of decimals"))
alert("Press s to start, p to pause and refresh to reset.")



let num = start_num
let timeout = null

document.addEventListener("keydown", (e) => {
    if (e.key == "s") {
        timeout = setTimeout(decFunc, interval)
    }
    if (e.key == "p") {
        if (timeout == null) {
            timeout = setTimeout(decFunc, interval)
        } else {
            clearTimeout(timeout)
            timeout = null 
        }
    }
})

function decFunc() {
    document.getElementById("num").innerHTML = num.toFixed(num_of_decimals)
    num -= dec
    timeout = setTimeout(decFunc, interval)
}

