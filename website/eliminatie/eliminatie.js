"use strict"

import { DropboxClient } from "../js/dropbox_api.js"

let unload = true;

window.onbeforeunload = function() {
    if (unload) {
        return void (0);
    }
    return "Data will be lost if you leave the page, are you sure?";
};

let client = new DropboxClient()

/* Deelnemers */

let deelnemers = {}

function setupDropdown() {
    let dropdown = document.getElementById("dropdownNames");
    dropdown.hidden = true;
    for (let naam of Object.keys(deelnemers)) {
        let new_option = document.createElement("tr");
        new_option.innerHTML = "<td>" + naam + "";
        new_option.value = naam;
        new_option.onclick = selectName;
        dropdown.append(new_option);
    }
}

function selectName() {
    let select = document.getElementById("naamKeuze");
    select.classList.remove("disabled");
    select.textContent = this.value;
    //no call BUBBLING showDropdown();
}


function showDropdown() {
    let dropdown = document.getElementById("dropdownNames");
    dropdown.hidden = !dropdown.hidden;
}


/* Vraag */

function checkboxClick(i) {
    eliminatie.addAnswer(i);
    eliminatie.displayVragen();
}


function nextVraag() {
    eliminatie.selected_vraag++;
    eliminatie.displayVragen();
}

function prevVraag() {
    eliminatie.selected_vraag--;
    eliminatie.displayVragen();
}

function jumpToVraag(index) {
    eliminatie.selected_vraag = index;
    eliminatie.displayVragen();
}



class Eliminatie {
    constructor(vragen, naam) {
        this.naam = naam;
        this.vragen = vragen;
        this.aantal_vragen = vragen.length;
        this.selected_vraag = undefined;
        this.vragen.forEach((element, index) => element.nr = index+1);
        this.aantal_beantwoord = 0;
    }
    
    displayVragen() {
        let vraag = document.getElementById("vraag");
        // show sidebar
        
        // hide or show elimination
        document.getElementById("eliminatie").hidden = this.selected_vraag == undefined;
        // show selected question
        vraag.children[0].textContent = this.vragen[this.selected_vraag].nr + ". " + this.vragen[this.selected_vraag].vraag;
        if (this.vragen[this.selected_vraag].type != "rank") {
            // show options
            let opties = vraag.querySelectorAll(".optie");
            let index = 0;
            for (let optie of opties) {
                optie.querySelector(".checkbox").innerHTML = "";
                if (index >= this.vragen[this.selected_vraag].aantal_opties) {
                    optie.hidden = true;
                }
                else {
                    optie.hidden = false;
                    optie.lastElementChild.textContent = this.vragen[this.selected_vraag].opties[index];  
                }
                index++;
            }
            // joker
            document.getElementById("joker").hidden = true //false;
            document.getElementById("joker").firstElementChild.innerHTML = '';
            let keuze_vraag = this.vragen[this.selected_vraag].keuze;
            if (keuze_vraag == "joker") {
                document.getElementById("joker").firstElementChild.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
            }
            else if (keuze_vraag != undefined) {
                opties[keuze_vraag].querySelector(".checkbox").innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
            }
            if (deelnemers[document.getElementById("naamKeuze").textContent]["joker"] <= deelnemers[document.getElementById("naamKeuze").textContent]["jokerGebruikt"]) {
                document.getElementById('joker').classList.add("disabled");
            }
            else {
                document.getElementById('joker').classList.remove("disabled");
            }           
        }
        else {
            let mol =  this.vragen[this.selected_vraag].keuze
            let opties = vraag.querySelectorAll(".optie");
            let index = 0;
            // hide default
            for (let optie of opties) {
                optie.querySelector(".checkbox").innerHTML = "";
                optie.hidden = true;
                index++;
            }
            // no joker
            document.getElementById("joker").hidden = true;
            // table for top-type
            let deelnemersRaster = document.createElement("table");
            deelnemersRaster.id = "deelnemersraster";
            let head = document.createElement("thead");
            let hrow = document.createElement("tr");
            for (let j = 1; j <= 5; j++) {
                let htd = document.createElement("th");
                htd.innerHTML = j;
                if (mol[j-1] != undefined) {
                    htd.classList.add("chosen");
                }
                hrow.append(htd);
            }
            head.append(hrow);
            deelnemersRaster.append(head);
            
            for (let i = 0; i < this.vragen[this.selected_vraag].opties.length; i++) {
                let new_col = document.createElement("tr");
                for (let j = 0; j < 5; j++) {
                    let new_td = document.createElement("td");
                    new_td.classList.add("rooster");
                    new_td.innerHTML = this.vragen[this.selected_vraag].opties[i];
                    new_td.onclick = () => eliminatie.choseName(i, j);
                    if (mol[j] != undefined && this.vragen[this.selected_vraag].opties.indexOf(mol[j]) == i) {
                        new_td.classList.add("chosen");
                    }
                    new_col.append(new_td);
                }
                deelnemersRaster.append(new_col);
            }
            vraag.append(deelnemersRaster);
        }
    }
    
    choseName(row, col) {
        let mol = this.vragen[this.selected_vraag].keuze
        mol[col] = this.vragen[this.selected_vraag].opties[row];
        this.vragen[this.selected_vraag].keuze = mol
        if (mol.filter((item) => item != undefined).length == this.vragen[this.selected_vraag].top) {
            this.vragen[this.selected_vraag].beantwoord = true
            document.getElementById("sidebar").children[this.selected_vraag].classList.add("filled");
            if (this.checkVolledig()) {
                document.getElementById("submit").classList.remove("disabled");
            }
        }
        let raster = document.getElementById("deelnemersraster");
        for (let tr of raster.getElementsByTagName('tr')) {
            tr.children[col].classList.remove("chosen");
        }
        raster.getElementsByTagName("th")[col].classList.add("chosen");
        raster.getElementsByTagName('tr')[row+1].children[col].classList.add("chosen");
    }
    
    addAnswer(optie) {
        if (this.vragen[this.selected_vraag].keuze == undefined) {
            this.aantal_beantwoord++;
        }
        if (optie == "joker") {
            if (deelnemers[document.getElementById("naamKeuze").textContent]["joker"] <= deelnemers[document.getElementById("naamKeuze").textContent]["jokerGebruikt"]) {
                return;
            }
        }
        this.vragen[this.selected_vraag].keuze = optie;
        document.getElementById("sidebar").children[this.selected_vraag].classList.add("filled");
        if (this.checkVolledig()) {
            document.getElementById("submit").classList.remove("disabled");
        }
        deelnemers[document.getElementById("naamKeuze").textContent]["jokerGebruikt"] = this.vragen.filter((item) => item.keuze == "joker").length;
        document.getElementById("pasvragen").innerHTML = "pasvragen: " + deelnemers[naamKeuze.textContent]["pasvraag"] //+ " | jokers: " + deelnemers[naamKeuze.textContent]["joker"] + "(gebruikt: " + deelnemers[naamKeuze.textContent]["jokerGebruikt"] + ")";
        
    }
    
    checkVolledig() {
        return this.vragen.filter(v => {
            if (v.type != "rank") return v.keuze == undefined
            else return !v.beantwoord
        }).length == 0
    }
    
    get selected_vraag() {return this._selected_vraag;}
    
    set selected_vraag(index) {
        if (index == undefined) index = 0
        if (this.selected_vraag == undefined) {
            this._selected_vraag = index;
            return
        }
        if (this.vragen[this.selected_vraag].type == "rank") {
            if (document.getElementById("deelnemersraster")) {
                document.getElementById("deelnemersraster").remove();
            }
        }
        if (index >= 0 && index < this.aantal_vragen) {
            if (this.selected_vraag == undefined) {
                this._selected_vraag = index;
                document.getElementById("sidebar").children[index].classList.add("selected");
            }
            else {
                document.getElementById("sidebar").children[this.selected_vraag].classList.remove("selected");
                this._selected_vraag = index;
                document.getElementById("sidebar").children[index].classList.add("selected");
            }
        }
        // else if (index == this.aantal_vragen) {
            //     document.getElementById("sidebar").children[this.selected_vraag].classList.remove("selected");
            //     this._selected_vraag = index;
            //     document.getElementById("sidebar").children[index].classList.add("selected");
            // }
        }
    }
    
    class Vraag {
        constructor(vraag, opties, type) {
            this.top = 5;
            this.vraag = vraag;
            this.opties = opties;
            this.aantal_opties = opties.length;
            this.keuze = type=="rank" ? new Array(this.top)  : undefined;
            this.nr = undefined;
            this.type = type
            this.beantwoord = false
        }
        
        get keuze() {
            return this._keuze;
        }
        
        set keuze(optie) {
            this._keuze = optie;
        }
        
        get nr() {
            return this._nr;
        }
        
        set nr(number) {
            this._nr = number;
        }
    }
    
    function setVragen() {
        client.readFile("/vragenlijsten.json").then(json => {
            json = JSON.parse(json)
            let actief_idx = json.findIndex((e => e.actief))
            console.log(json, actief_idx)
            if (actief_idx == -1) {
                alert("Fout bij organisatoren: geen actieve eliminatie")
                window.location.href = "./"
                return
            } else {
                client.readFile("/deelnemers.json").then(text => {
                    let deelnemers_json = JSON.parse(text)
                    for (let deelnemer of deelnemers_json) {
                        deelnemers[deelnemer.naam] = {}
                        deelnemers[deelnemer.naam].pasvraag = deelnemer.pasvragen
                        deelnemers[deelnemer.naam].joker = deelnemer.jokers
                        deelnemers[deelnemer.naam].jokerGebruikt = 0
                    }
                    let vragen = json[actief_idx].vragen.map(v => new Vraag(v.vraag, v.opties, v.type))
                    eliminatie = new Eliminatie(vragen, json[actief_idx].naam)
                    setupDropdown();                    
                })
            }
        }).catch(err => {
            console.log(err)
            return
        })
        
    }
    
    let eliminatie = undefined
    setVragen(eliminatie)
    
    function convertToSend(data) {
        let re = {
            "eliminatie": data.naam,
            "deelnemer": document.getElementById("naamKeuze").textContent,
            "pasvragen": deelnemers[document.getElementById("naamKeuze").textContent]["pasvraag"],
            "jokers": deelnemers[document.getElementById("naamKeuze").textContent]["joker"],
            "minuten": timer.getMinutes(),
            "seconden": timer.getSeconds(),
            "antwoorden": data.vragen.map((e,i,r) => {
                if (e.type != "rank") {
                    return e.keuze
                } else {
                    return e.keuze.map(v => e.opties.indexOf(v))
                }
            }),
        }
        return re;
    }
    
    
    /* clock */
    
    let timerId;
    let timer = new Date(0);
    
    function update() {
        timer.setSeconds(timer.getSeconds() + 1);
        let clock = document.getElementById('clock');
        
        let minutes = timer.getMinutes();
        if (minutes < 10) minutes = '0' + minutes;
        clock.children[0].innerHTML = minutes;
        
        let seconds = timer.getSeconds();
        if (seconds < 10) seconds = '0' + seconds;
        clock.children[1].innerHTML = seconds;
    }

function clockStart() {
    let name = document.getElementById("naam");
    let start = document.getElementById("start");
    let naamKeuze = document.getElementById("naamKeuze");
    if (naamKeuze.className != "disabled") {
        name.firstElementChild.textContent = "naam: " + naamKeuze.textContent;
        document.getElementById("pasvragen").hidden = false;
        document.getElementById("pasvragen").innerHTML = "pasvragen: " + deelnemers[naamKeuze.textContent]["pasvraag"] //+ " | jokers: " + deelnemers[naamKeuze.textContent]["joker"] + "(gebruikt: " + deelnemers[naamKeuze.textContent]["jokerGebruikt"] + ")";
        naam.querySelector(".dropdown").hidden = true;
        start.hidden = true;
        for (let i = 0; i < eliminatie.aantal_vragen; i++) {
            let new_node = document.createElement("div")
            new_node.innerHTML = `${i}.`
            new_node.addEventListener("click", function(i) {return function() {jumpToVraag(i)}}(i))
            document.getElementById("sidebar").append(new_node);
            console.log("e")
        }
        eliminatie.selected_vraag = 0;
        eliminatie.displayVragen();
        timerId = setInterval(update, 1000);
        unload = false;
    }
    else {
        start.textContent = "kies een naam";
        setTimeout(() => start.textContent = "start", 2000);
    }
}

function clockStop() {
    if (document.getElementById("submit").classList.contains('disabled')) {
        let go = confirm('Druk oke');
        if (!go) {
            return;
        }
    }
    clearInterval(timerId);
    let clock = document.getElementById('clock');
    clock.style.backgroundColor = "#46aebc";
    setTimeout(() => clock.style.backgroundColor ="", 2000);
    let path = `/${eliminatie.naam}/${document.getElementById("naamKeuze").textContent}_${new Date().toLocaleTimeString()}.json`
    client.writeFile(path, JSON.stringify(convertToSend(eliminatie))).then( response => {
        if (response == undefined) {
            let opnieuw = confirm("Verzenden mislukt!\nOpnieuw proberen?");
            document.getElementById("eliminatie").hidden = true;
            if (!opnieuw) {
                unload = true;
                let return_href = document.location.protocol == "file:" ? "./index.html" : "./";
                window.location.href = return_href;
            }
        }
        else {
            document.body.innerHTML = "<div class='info'><p>Bedankt.</p><p>De Eliminatie-vragen zijn goed ingevuld.</p></div><div class='loadingBox'><div id='loadingBar'></div></div>";
            unload = true;
            let return_href = "../../index.html";
            setTimeout(() => loadingBar.style.width = "100%",100);
            setTimeout(() => window.location.href = return_href, 5100);
        }
      })
}

document.querySelector("#naam > .dropdown").addEventListener("click", showDropdown)
document.querySelector("#start").addEventListener("click", clockStart)
document.querySelectorAll("#vraagNav > .button")[0].addEventListener("click", prevVraag)
document.querySelectorAll("#vraagNav > .button")[1].addEventListener("click", nextVraag)
document.querySelector("#joker").addEventListener("click", () => checkboxClick("joker"))
let iter = 0
for (let optie_checkbox of document.querySelectorAll("#vraag > div > div > .optie")) {
    optie_checkbox.addEventListener("click", function(i) {return function() {checkboxClick(i)}}(iter))
    document.querySelector("#submit").addEventListener("click", clockStop)
    iter++
}

