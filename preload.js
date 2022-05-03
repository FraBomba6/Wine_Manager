const electron = require("electron")
const ipc = electron.ipcRenderer;
document.addEventListener("DOMContentLoaded", function(){
    ipc.send("mainWindowLoaded")
    ipc.on("headersSent", function (event, result){
        let db_table = document.getElementById("db");
        let thead = document.createElement("thead");
        let row = document.createElement("tr");
        for(let i = 0; i < result.length; i++) {
            let heading = document.createElement('th');
            heading.innerHTML = result[i]["name"];
            row.appendChild(heading);
        }
        thead.appendChild(row);
        db_table.appendChild(thead);
    })
    ipc.on("resultSent", function(event, result){
        let db_table = document.getElementById("db");
        let tbody = document.createElement("tbody");
        for(let i = 0; i < result.length; i++) {
            let tr = document.createElement("tr");
            let nome = document.createElement("td");
            nome.innerHTML = result[i]["nome"];
            tr.appendChild(nome);
            let annata = document.createElement("td");
            annata.innerHTML = result[i]["annata"];
            tr.appendChild(annata);
            let cantina = document.createElement("td");
            cantina.innerHTML = result[i]["cantina"];
            tr.appendChild(cantina);
            let prezzo = document.createElement("td");
            prezzo.innerHTML = result[i]["prezzo"];
            tr.appendChild(prezzo);
            let vinificazione = document.createElement("td");
            vinificazione.innerHTML = result[i]["vinificazione"];
            tr.appendChild(vinificazione);
            let colore = document.createElement("td");
            colore.innerHTML = result[i]["colore"];
            tr.appendChild(colore);
            let macerato = document.createElement("td");
            macerato.innerHTML = result[i]["macerato"];
            tr.appendChild(macerato);
            let listino = document.createElement("td");
            listino.innerHTML = result[i]["listino"];
            tr.appendChild(listino);
            tbody.appendChild(tr);
        }
        db_table.appendChild(tbody);
    });
});