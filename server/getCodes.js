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
        return {n_clicks: this.n_clicks, message: "Code correct! "+ this.n_clicks == 1 ? "1 click added" : `${this.n_clicks} clicks added. You earned €0.${(CENT_PER_CLICK_PER_CLICK*2 >= 10 ? "" : "0") + CENT_PER_CLICK_PER_CLICK*2}`};
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

    checkCode = function(code, room, CENT_PER_CLICK) {
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

codes.addCode("ik_ben_de_mol", "room1", -1, 1)
codes.addCode("ik_ben_de_mol", "room2", -1, 1)
codes.addCode("ik_ben_de_mol", "room3", -1, 1)

codes.addCode("sudoku_7132", "room1", 3, 3, "sudoku")
codes.addCode("sudoku_7132", "room2", 3, 3, "sudoku")
codes.addCode("sudoku_7132", "room3", 3, 3, "sudoku")

codes.addCode("octadoku_572", "room1", 3, 5, "octadoku")
codes.addCode("octadoku_1012", "room2", 3, 5, "octadoku")
codes.addCode("octadoku_316", "room3", 3, 5, "octadoku")

// TODO: 17*blauw + 26*geel + 35*groen + 59*rood
codes.addCode("", "room1", -1, 5)
codes.addCode("", "room2", -1, 5)
codes.addCode("", "room3", -1, 5)

codes.addCode("winnen", "room1", -1, 1)
codes.addCode("winnen", "room2", -1, 1)
codes.addCode("winnen", "room3", -1, 1)
codes.addCode("de_mol", "room1", -1, 1)
codes.addCode("de_mol", "room2", -1, 1)
codes.addCode("de_mol", "room3", -1, 1)
codes.addCode("escape_room", "room1", -1, 1)
codes.addCode("escape_room", "room2", -1, 1)
codes.addCode("escape_room", "room3", -1, 1)
codes.addCode("spannend", "room1", -1, 1)
codes.addCode("spannend", "room2", -1, 1)
codes.addCode("spannend", "room3", -1, 1)
codes.addCode("burgies", "room1", -1, 1)
codes.addCode("burgies", "room2", -1, 1)
codes.addCode("burgies", "room3", -1, 1)

codes.addCode("usb_is_geen_bus", "room1", -1, 2)
codes.addCode("usb_is_geen_bus", "room2", -1, 2)
codes.addCode("usb_is_geen_bus", "room3", -1, 2)

codes.addCode("kamer_b", "room1", 1, 3, "kamer")
codes.addCode("kamer_b", "room2", 1, 3, "kamer")
codes.addCode("kamer_b", "room3", 1, 3, "kamer")

codes.addCode("adonis", "room1", -1, 1)
codes.addCode("adonis", "room2", -1, 1)
codes.addCode("adonis", "room3", -1, 1)
codes.addCode("adios", "room1", -1, 1)
codes.addCode("adios", "room2", -1, 1)
codes.addCode("adios", "room3", -1, 1)
codes.addCode("insop", "room1", -1, 1)
codes.addCode("insop", "room2", -1, 1)
codes.addCode("insop", "room3", -1, 1)
codes.addCode("piano", "room1", -1, 1)
codes.addCode("piano", "room2", -1, 1)
codes.addCode("piano", "room3", -1, 1)
codes.addCode("pinas", "room1", -1, 1)
codes.addCode("pinas", "room2", -1, 1)
codes.addCode("pinas", "room3", -1, 1)
codes.addCode("pinda", "room1", -1, 1)
codes.addCode("pinda", "room2", -1, 1)
codes.addCode("pinda", "room3", -1, 1)
codes.addCode("pions", "room1", -1, 1)
codes.addCode("pions", "room2", -1, 1)
codes.addCode("pions", "room3", -1, 1)
codes.addCode("spion", "room1", -1, 1)
codes.addCode("spion", "room2", -1, 1)
codes.addCode("spion", "room3", -1, 1)
codes.addCode("podia", "room1", -1, 1)
codes.addCode("podia", "room2", -1, 1)
codes.addCode("podia", "room3", -1, 1)

// TODO
codes.addCode("cola_", "room1", 1, 3, "cola")
codes.addCode("cola_", "room2", 1, 3, "cola")
codes.addCode("cola_", "room3", 1, 3, "cola")
 
codes.addCode("hey", "room1", -1, 2)
codes.addCode("hey", "room2", -1, 2)
codes.addCode("hey", "room3", -1, 2)

codes.addCode("schaak_c3e5", "room1", 1, 3, "schaak")
codes.addCode("schaak_f5h6", "room2", 1, 3, "schaak")
codes.addCode("schaak_d6g6", "room3", 1, 3, "schaak")

codes.addCode("jungle_bc9w", "room1", 2, 5, "jungle")
codes.addCode("jungle_48de", "room2", 2, 5, "jungle")
codes.addCode("jungle_rf4w", "room3", 2, 5, "jungle")

codes.addCode("driehoek", "room1", -1, 5)
codes.addCode("driehoek", "room2", -1, 5)
codes.addCode("driehoek", "room3", -1, 5)

codes.addCode("raadsel_1987", "room1", 1, 5, "raadsel")
codes.addCode("raadsel_1987", "room2", 1, 5, "raadsel")
codes.addCode("raadsel_1987", "room3", 1, 5, "raadsel")

codes.addCode("wortel_28908", "room1", -1, 5)
codes.addCode("wortel_28908", "room2", -1, 5)
codes.addCode("wortel_28908", "room3", -1, 5)

codes.addCode("vlaemsche_kermis", "room1", -1, 5)
codes.addCode("vlaemsche_kermis", "room2", -1, 5)
codes.addCode("vlaemsche_kermis", "room3", -1, 5)

codes.addCode("6734912", "room1", -1, 5)
codes.addCode("6734912", "room2", -1, 5)
codes.addCode("6734912", "room3", -1, 5)

codes.addCode("gaten", "room1", -1, 3)
codes.addCode("nkbuhwlie", "room1", -1, 3)
codes.addCode("gaten", "room2", -1, 3)
codes.addCode("ubhztlefg", "room2", -1, 3)
codes.addCode("gaten", "room3", -1, 3)
codes.addCode("xvbheqwag", "room3", -1, 3)


codes.addCode("olympiade_b", "room1", 1, 3, "olympiade")
codes.addCode("olympiade_e", "room2", 1, 3, "olympiade")
codes.addCode("olympiade_b", "room3", 1, 3, "olympiade")

codes.addCode("binair_1011001010", "room1", -1, 3)
codes.addCode("binair_1011001010", "room2", -1, 3)
codes.addCode("binair_1011001010", "room3", -1, 3)

codes.addCode("nonogram_donut", "room1", -1, 3)
codes.addCode("nonogram_donut", "room2", -1, 3)
codes.addCode("nonogram_donut", "room3", -1, 3)

codes.addCode("samuel", "room1", -1, 3)
codes.addCode("samuel", "room2", -1, 3)
codes.addCode("samuel", "room3", -1, 3)

codes.addCode("symmetrie", "room1", -1, 2)
codes.addCode("symmetrie", "room2", -1, 2)
codes.addCode("symmetrie", "room3", -1, 2)

codes.addCode("pi24nk", "room1", -1, -5)
codes.addCode("pi24nk", "room2", -1, -5)
codes.addCode("p45_0p", "room1", -1, -5)
codes.addCode("p45_0p", "room3", -1, -5)
codes.addCode("nn1nu5", "room2", -1, -5)
codes.addCode("nn1nu5", "room3", -1, -5)

codes.addCode("pg5t_de7k", "room2", -1, 2)
codes.addCode("pg5t_de7k", "room3", -1, 2)
codes.addCode("sdg1_de7k", "room1", -1, 2)
codes.addCode("sdg1_de7k", "room3", -1, 2)
codes.addCode("sdg1_pg5t", "room1", -1, 2)
codes.addCode("sdg1_pg5t", "room2", -1, 2)


codes.addCode("74kp9srtqv", "room1", -1, 3)
codes.addCode("74kp9srtqv", "room2", -1, 3)
codes.addCode("74kp9srtqv", "room3", -1, 3)



module.exports = function() {return codes;}


