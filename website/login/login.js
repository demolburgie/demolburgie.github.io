"use strict"

import { DropboxClient } from "../js/dropbox_api.js"

let client = new DropboxClient();

function psw_hash(psw) {
    let salt = "demoladmin";
    let algo = CryptoJS.algo.SHA256.create();
    algo.update(psw, "utf-8");
    algo.update(CryptoJS.SHA256(salt), "utf-8");
    return algo.finalize().toString(CryptoJS.enc.hex);
}

async function login() {
    let hash = await client.readFile("/pwd.txt")
    if (hash == psw_hash(ww.value)) {
        sessionStorage.setItem("psw", ww.value)
        window.location.href = "../config/config.html"
    } else {
        alert("Password is incorrect.")
    }
    ww.value = ""
}

async function wijzig_ww() {
    if (await client.readFile("/pwd.txt") == psw_hash(old_ww.value)) {
        await client.writeFile("/pwd.txt", psw_hash(new_ww.value))
        alert("Password changed.")
    } else {
        alert("Current password is incorrect.")
    }
    old_ww.value = ""
    new_ww.value = ""
}

document.querySelector("#wijzig").addEventListener("click", wijzig_ww)
document.querySelector("#login").addEventListener("click", login)
