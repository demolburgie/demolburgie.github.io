"use strict"

import { DropboxClient } from "../js/dropbox_api.js"

const client = new DropboxClient()

const eliminatie_name = decodeURI(window.location.href).split("=")[1]


// list of {"eliminatie":"test","deelnemer":"Jan","pasvragen":3,"jokers":0,"minuten":0,"seconden":21,"antwoorden":[0,1,[0,3,0,5,6]]}
let antwoorden = undefined

let file_names = undefined


let vragen = undefined
init()

function check(deelnemer, i) {
    if (vragen[i].type != "rank") {
        if (deelnemer.antwoorden[i] == "joker") return 1
        return 0+(deelnemer.antwoorden[i] == vragen[i].antwoord)
    } else {
        return 5 - ((deelnemer.antwoorden[i].findIndex(v => vragen[i].antwoord == v) != -1) ? deelnemer.antwoorden[i].findIndex(v => vragen[i].antwoord == v) : 5)
    }
}

function totaleScore(deelnemer) {
    let score = 0
    let fouten = 0
    for (let i=0;i<vragen.length;i++) {
        let re = check(deelnemer, i)
        if (vragen[i].type != "top" && re == 0) fouten++
        score += re
    }
    return score + Math.min(fouten, deelnemer.pasvragen)
}

function ToonResults() {
    console.log(vragen, antwoorden)
    let html = "<table>"
    html += "<tr><th>deelnemer</th><th>pt</th><th>tijd</th><th>pasvragen</th>"
    for (let i=0; i<vragen.length;i++) {
        html += "<th>"+(i+1)+"</th>"
    }
    html += "<th>file</th><th></th>"
    let deelnemer_idx = 0
    for (let deelnemer of antwoorden) {
        html += "<tr>"
        html += "<td>"+deelnemer.deelnemer+"</td>"
        html += "<td>"+totaleScore(deelnemer)+"</td>"
        html += "<td>"+deelnemer.minuten+":"+deelnemer.seconden+"</td>"
        html += "<td>"+deelnemer.pasvragen+"</td>"
        for (let i=0;i<vragen.length;i++) {
            html += "<td>"+check(deelnemer, i)+"</td>"
        }
        html += "<td>"+file_names[deelnemer_idx]+"</td><td><button value='"+deelnemer_idx+"'>del</button></td>"
        html += "</tr>"
        deelnemer_idx++;
    }
    html += "</tr>"
    html += "</table>"
    document.body.innerHTML = html
    for (let node of document.querySelectorAll("button")) {
        node.addEventListener("click", async (e) => {await client.deleteFile(`/${eliminatie_name}/${file_names[e.target.value]}`); location.reload();})
    }
}

async function init() {
    client.readFile("/vragenlijsten.json").then((text) => {
        let json = JSON.parse(text)
        vragen = json.find((e) => e.naam == eliminatie_name).vragen
        client.getFilesInFolder(`/${eliminatie_name}`).then((files) => {
            file_names = files
            return Promise.all(files.map(v => {
                return client.readFile(`/${eliminatie_name}/${v}`).then((text) => JSON.parse(text))
            })).then((re) => {antwoorden = re;}).then(() => ToonResults())
        })
    })
}