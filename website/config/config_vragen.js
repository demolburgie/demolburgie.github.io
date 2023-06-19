import { DropboxClient } from "../js/dropbox_api.js"
import { VragenLijst, Vraag } from "../js/vragen.js"

if (sessionStorage.getItem("psw") == undefined) {
    window.location.href = "../../../"
}

let naam = decodeURI(window.location.href).split("=")[1]
const client = new DropboxClient()


let vragenlijsten = VragenLijst.parse(JSON.parse(await client.readFile("/vragenlijsten.json")))
let vragenlijst = vragenlijsten.find((e) => e.naam == naam)
console.log(vragenlijst, vragenlijsten)
showVragen()

function addVraag() {
    vragenlijst.vragen.push(new Vraag())
    showVragen();
}
document.querySelector("#add-vraag").addEventListener("click", addVraag)

function saveVragen() {
    client.writeFile("/vragenlijsten.json", JSON.stringify(vragenlijsten))
}
document.querySelector("#save-vragen").addEventListener("click", saveVragen)

function showVragen() {
    vragenlijst.vragen.sort((a,b) => a.idx < b.idx)
    console.log(vragenlijst)
    document.querySelector("#vragen").innerHTML = ""
    for (let i=0; i < vragenlijst.vragen.length; i++) {
        vragenlijst.vragen[i].createNode(vragenlijst, i, showVragen)
    }
}
