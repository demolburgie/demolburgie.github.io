"use strict"

class Code {
    constructor(code, room, max_tries, n_clicks, prefix=undefined) {
        this.code = code
        this.room = room
        this.max_tries = max_tries
        this.n_clicks = n_clicks
        this.prefix = undefined
        this.used_tries = 0
        this.used = false
    }

    checkCode = function(room) {
        if (this.room != room) {
            return {n_clicks: 0, message: "Code incorrect."};
        }
        if (this.used) {
            return {n_clicks: 0, message: "Code already used."}
        }
        if (this.max_tries != -1 && this.max_tries < this.used_tries+1) {
            return {n_clicks: 0, message: "No tries left."}
        }
        this.used = true
        this.used_tries += 1
        return {n_clicks: this.n_clicks, message: "Code correct! "+ this.n_clicks == 1 ? "1 click added" : `${this.n_clicks} clicks added.`};
    }

    triesLeft = function() {
        return Math.max(this.max_tries - this.used_tries, 0)
    }

}
class Codes {
    constructor() {
        this.codes = {}
        this.prefix_codes = {}
    }

    addCode = function(code, room, tries, n_clicks, prefix=undefined) {
        this.codes[code+"@"+room] = new Code(code, room, tries, n_clicks)
        if (prefix != undefined) {
            if (Object.keys(this.prefix_codes).filter((v) => this.codes[this.prefix_codes[v]].room == room).find((v) =>  v.startsWith(prefix)) != undefined) {
                console.log("PREFIX COLLISION!!!!", prefix, Object.keys(this.prefix_codes).filter((v) => this.codes[this.prefix_codes[v]].room == room).find((v) =>  v.startsWith(prefix)))
            }
            if (Object.keys(this.prefix_codes).filter((v) => this.codes[this.prefix_codes[v]].room == room).find((v) =>  prefix.startsWith(v)) != undefined) {
                console.log("PREFIX COLLISION!!!!", prefix, Object.keys(this.prefix_codes).filter((v) => this.codes[this.prefix_codes[v]].room == room).find((v) =>  prefix.startsWith(v)))
            }
            this.prefix_codes[prefix+"@"+room] = code+"@"+room
        }
    }

    checkCode = function(code, room) {
        if (code+"@"+room in this.codes) {
            return this.codes[code+"@"+room].checkCode(room)
        }
        let prefix = Object.keys(this.prefix_codes).filter((v) => this.codes[this.prefix_codes[v]].room == room && !this.codes[this.prefix_codes[v]].used).find((v) => code.startsWith(v.split("@")[0]))
        if (prefix == undefined) {
            return {n_clicks: 0, message: "Code incorrect."};
        } else {
            let curr_code = this.codes[this.prefix_codes[prefix]]
            curr_code.used_tries += 1
            let tries_left = curr_code.triesLeft()
            return {n_clicks: 0, message: "Code incorrect. " + (tries_left == 1 ? "1 Try left." : `${tries_left} tries left.`)};
        }
    }
    
}

let codes = new Codes()

codes.addCode("test", "room1", 1, 1, "t")
codes.addCode("test2", "room1", -1, 1)
codes.addCode("som112", "room1", 5, 5, "som")
codes.addCode("som112", "room2", 1, 1, "som")
codes.addCode("som112", "room3", 1, 1, "som")
codes.addCode("6734912", "room1", -1, 3) // audio
codes.addCode("6734912", "room2", -1, 3) // audio
codes.addCode("6734912", "room3", -1, 3) // audio

module.exports = function() {return codes;}


