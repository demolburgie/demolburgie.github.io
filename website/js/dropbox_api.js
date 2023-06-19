"use strict"

export class DropboxClient {
    client_id = "qdohtz1fti329wd"
    client_secret = "15tn8h0gbnks8oq"
    refresh_token = "lI9zTZgzmhgAAAAAAAAAAY4E6fHAZNrA7pjQ2U7wuqmXvkXC0mI7DcWHiVT3uSAr"
    constructor() {
        let access_token = "sl.Bga317WfV3H8cBMI8kuK0DhsMgaIqtVsKqELYVnHgrFDc3Sx6hsI7vQaGAEo4sE6_WDH5b6WQEdbGMH7R1Qqf5x_t9nhkSAuySJ-mnIhX2EWhqSL-8FkyABTntAPwqUUNSbCZqg"
        this.headers = {"Authorization": `Bearer ${access_token}`}
    }

    deleteFile = async function(path_to_file) {
        return this.fetch("https://api.dropboxapi.com/2/files/delete_v2", "POST", {"Content-Type": "application/json"}, `{"path": "${path_to_file}"}`) 
    }

    readFile = async function(path_to_file) {
        return this.fetch("https://content.dropboxapi.com/2/files/download", "GET", {"Dropbox-API-Arg": `{"path":"${path_to_file}"}`})
    }

    writeFile = async function(path_to_file, data) {
        return this.fetch("https://content.dropboxapi.com/2/files/upload", "POST",
            {
                "Dropbox-API-Arg": `{"path":"${path_to_file}", "mode":"overwrite"}`,
                "Content-Type": "application/octet-stream",
            },
            data
        )
    }

    getFilesInFolder = async function(path_to_folder) {
        return this.fetch("https://api.dropboxapi.com/2/files/list_folder", "POST", {"Content-Type": "application/json"}, `{"path": "${path_to_folder}"}`)
            .then((response) => {
                let json = JSON.parse(response)
                return json.entries.map((e) => e.name)
            })
    }

    fetch = async function(path, method, headers={}, data=undefined) {
        let final_headers = new Headers();
        Object.keys(this.headers).forEach((key) => final_headers.set(key, this.headers[key]));
        Object.keys(headers).forEach((key) => final_headers.set(key, headers[key]))
        let options = {method: method, headers: final_headers, body: data}
        return fetch(path, options).then((response) => {
            if (response.ok) {
                return response.text()
            } else {
                if (response.status == 401) {
                    return this.refreshToken().then(() => {return this.fetch(path, method, headers, data)})
                } else {
                    alert("could not connect to database")
                    return
                }
            }
        })
    }

    refreshToken = async function() {
        let client_id = "qdohtz1fti329wd"
        let client_secret = "15tn8h0gbnks8oq"
        let refresh_token = "lI9zTZgzmhgAAAAAAAAAAY4E6fHAZNrA7pjQ2U7wuqmXvkXC0mI7DcWHiVT3uSAr"
        let headers = new Headers()
        headers.append("Content-Type", "application/x-www-form-urlencoded")
        headers.append("Authorization", "Basic " + btoa(`${client_id}:${client_secret}`))
        let params = new URLSearchParams({grant_type: "refresh_token", refresh_token: refresh_token})
        return fetch("https://api.dropbox.com/oauth2/token", {
            method: "POST",
            headers: headers,
            body: params
        }).then((response) => {
            if (response.ok) {
                return response.json().then((json) => this.headers["Authorization"] = `Bearer ${json["access_token"]}`)
            }
        })
    }
}
