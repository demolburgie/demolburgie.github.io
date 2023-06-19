"use strict"

const VraagType = {
    NORMAL : "normal",
    RANK : "rank"
}

function switchElements(arr, x, y) {
    let re = arr.map((v,i, arr) => {
        if (i == x) {return arr[y]}
        else if (i == y) {return arr[x]}
        else {return v}
    })
    return re
}

export class Vraag {
    constructor(vraag, type, opties, antwoord) {
        this.vraag = vraag || "Voorbeeld vraag"
        this.type = type || VraagType.NORMAL
        this.opties = opties || ["Optie1", "Optie2"]
        this.antwoord = antwoord || 0
    }

    static parse = function(json) {
        return new Vraag(json["vraag"], json["type"], json["opties"], json["antwoord"])
    }

    createNode = function(vragenlijst, i, updateFct) {
        let child = document.createElement("div")
        child.id = "vraag-"+i
        child.innerHTML = `<div>
            <button>remove</button>
            <button>up</button>
            <button>down</button>
            <select>
                <option value="normal">Normal</option>
                <option value="rank">Rank</option>
            </select>
            <button>add option</button>
            </div>
            <div>vraag: <textarea></div>`
        for (let j=0; j<this.opties.length; j++){
            child.innerHTML += "<div class='option" + j +"'><input type='checkbox'><input> <button>remove</button></div>"
        }
        child.innerHTML += "<hr>"
        for (let j=0; j<this.opties.length; j++){
            child.querySelectorAll(".option" + j + " > input")[0].checked = this.antwoord == j
            child.querySelectorAll(".option" + j + " > input")[0].addEventListener("change", (function(j, self) {return function() {self.antwoord = j; updateFct();}})(j, this))
            child.querySelectorAll(".option" + j + " > input")[1].value = this.opties[j]
            child.querySelectorAll(".option" + j + " > input")[1].addEventListener("change", (e) => {this.opties[j]= e.target.value})
            child.querySelector(".option" + j + " > button").addEventListener("click", (function(opties, j) {return function() {opties.splice(j,1); updateFct();}})(this.opties, j))
        }
        let buttons = child.querySelectorAll("div > button")
        buttons[0].addEventListener("click", (function(i) {return function() {vragenlijst.vragen.splice(i,1); updateFct();}})(i))
        buttons[1].addEventListener("click", (function(i) {return function() {vragenlijst.vragen = switchElements(vragenlijst.vragen, i, Math.max(0, i-1)); updateFct();}})(i))
        buttons[2].addEventListener("click", (function(i) {return function() {vragenlijst.vragen = switchElements(vragenlijst.vragen, i, Math.min(vragenlijst.vragen.length, i+1)); updateFct();}})(i))
        buttons[3].addEventListener("click", (function(opties) {return function() {opties.push("optie"); updateFct();}})(this.opties))
        let inputs = child.querySelectorAll("div > textarea")
        inputs[0].value = this.vraag
        inputs[0].addEventListener("change", (e) => {this.vraag=e.target.value})
        child.querySelector("div > select").value = this.type
        child.querySelector("div > select").addEventListener("change", (e) => {this.type = e.target.value})
        document.querySelector("#vragen").append(child)

    }
}

export class VragenLijst {
    constructor(naam, actief, vragen) {
        this.naam = naam || new Date().toISOString()
        this.actief = actief || false
        this.vragen = vragen || []
    }

    createNode = function(vragenlijsten, i, updateFct) {
        let child = document.createElement("div")
        child.id = "vragenlijst-"+i
        child.innerHTML = `<input type="checkbox" value="actief"><input><button>remove</button><button>edit</button><button>results</button>`
        let inputs = child.querySelectorAll("input")
        inputs[0].checked = this.actief
        inputs[0].addEventListener("change", (v) => {
            if (v.target.checked) {
                vragenlijsten.forEach(element => {
                    if (element != this) {
                        element.actief = false
                    } else {
                        element.actief = v.target.checked
                    }
                });
            }
            updateFct();
        })
        inputs[1].value = this.naam
        inputs[1].addEventListener("change", (e) => {this.naam = e.target.value})
        let buttons = child.querySelectorAll("button")
        buttons[0].addEventListener("click", (function(i) {return function() {vragenlijsten.splice(i,1); updateFct();}})(i))
        buttons[1].addEventListener("click", (function(naam) {return function() {window.location.href="config_vragen.html?name="+naam}})(this.naam))
        buttons[2].addEventListener("click", (function(naam) {return function() {window.location.href="view_results.html?name="+naam}})(this.naam))
        document.querySelector("#vragenlijsten").append(child)
    }

    static parse = function(json) {
        return json.map(element => {
            return new VragenLijst(element["naam"], element["actief"], element["vragen"].map(e => Vraag.parse(e)))
        });
    }
}