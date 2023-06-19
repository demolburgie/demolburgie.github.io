import { DropboxClient } from "../js/dropbox_api.js"
import { VragenLijst } from "../js/vragen.js"

if (sessionStorage.getItem("psw") == undefined) {
    window.location.href = "../../../"
}

const client = new DropboxClient()
let deelnemers = JSON.parse(await client.readFile("/deelnemers.json"))
showDeelnemers()

let vragenlijsten = VragenLijst.parse(JSON.parse(await client.readFile("/vragenlijsten.json")))
showVragenlijsten()

function addDeelnemer() {
    deelnemers.push({naam: "naam", pasvragen: 0, jokers: 0})
    showDeelnemers()
}
document.querySelector("#add-deelnemer").addEventListener("click", addDeelnemer)

function saveDeelnemers() {
    client.writeFile("/deelnemers.json", JSON.stringify(deelnemers))
}
document.querySelector("#save-deelnemers").addEventListener("click", saveDeelnemers)

function showDeelnemers() {
    document.querySelector("#deelnemers").innerHTML = ""
    for (let i=0; i < deelnemers.length; i++) {
        let child = document.createElement("div")
        child.id = "deelnemer-"+i
        child.innerHTML = `<button>remove</button><input> pasvragen: ${deelnemers[i].pasvragen}<button>-</button><button>+</button>, jokers: ${deelnemers[i].jokers}<button>-</button><button>+</button>`
        child.querySelector("input").value = deelnemers[i].naam
        child.querySelector("input").addEventListener("input", (function(i) {return function() {deelnemers[i].naam = child.querySelector("input").value}})(i))
        let buttons = child.querySelectorAll("button")
        buttons[0].addEventListener("click", (function(i) {return function() {deelnemers.splice(i,1);showDeelnemers();}})(i))
        buttons[1].addEventListener("click", (function(i) {return function() {deelnemers[i].pasvragen=Math.max(0, deelnemers[i].pasvragen-1);showDeelnemers();}})(i))
        buttons[2].addEventListener("click", (function(i) {return function() {deelnemers[i].pasvragen++;showDeelnemers();}})(i))
        buttons[3].addEventListener("click", (function(i) {return function() {deelnemers[i].jokers=Math.max(0, deelnemers[i].jokers-1);showDeelnemers();}})(i))
        buttons[4].addEventListener("click", (function(i) {return function() {deelnemers[i].jokers++;showDeelnemers();}})(i))
        document.querySelector("#deelnemers").append(child)
    }
}

function addVragenlijst() {
    vragenlijsten.push(new VragenLijst())
    showVragenlijsten();
}
document.querySelector("#add-vragenlijst").addEventListener("click", addVragenlijst)

function saveVragenlijsten() {
    client.writeFile("/vragenlijsten.json", JSON.stringify(vragenlijsten))
}
document.querySelector("#save-vragenlijsten").addEventListener("click", saveVragenlijsten)

function showVragenlijsten() {
    document.querySelector("#vragenlijsten").innerHTML = ""
    for (let i=0; i < vragenlijsten.length; i++) {
        vragenlijsten[i].createNode(vragenlijsten, i, showVragenlijsten)
    }
}
