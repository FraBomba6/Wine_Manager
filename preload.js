const electron = require("electron")
const ipc = electron.ipcRenderer;

function generate_input_text_element(name, value) {
    let input = document.createElement("input");
    input.type = "text";
    input.name = name;
    input.value = value;
    return input;
}

document.addEventListener("DOMContentLoaded", function(){
    ipc.send("mainWindowLoaded")
    ipc.on("headersSent", function (event, result){
        let db_table = document.getElementById("db");
        let thead = document.createElement("thead");
        let row = document.createElement("tr");
        for(let i = 0; i < result.length; i++) {
            let heading = document.createElement('th');
            heading.id = result[i]["name"] + "Header";
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
            let nome_input = generate_input_text_element("nome", result[i]["nome"])
            nome.appendChild(nome_input);
            tr.appendChild(nome);
            let annata = document.createElement("td");
            let annata_input = generate_input_text_element("annata", result[i]["annata"]);
            annata.appendChild(annata_input);
            tr.appendChild(annata);
            let cantina = document.createElement("td");
            let cantina_input = generate_input_text_element("cantina", result[i]["cantina"]);
            cantina.appendChild(cantina_input);
            tr.appendChild(cantina);
            let prezzo = document.createElement("td");
            let prezzo_input = generate_input_text_element("prezzo", result[i]["prezzo"]);
            prezzo.appendChild(prezzo_input);
            tr.appendChild(prezzo);
            let vinificazione = document.createElement("td");
            let vinificazione_select = document.createElement("select");
            vinificazione_select.name = "vinificazione";
            let vs_option_1 = document.createElement("option");
            vs_option_1.value = "fermo";
            vs_option_1.innerHTML = "Fermo";
            let vs_option_2 = document.createElement("option");
            vs_option_2.value = "frizzante";
            vs_option_2.innerHTML = "Frizzante";
            let vs_option_3 = document.createElement("option");
            vs_option_3.value = "spumante";
            vs_option_3.innerHTML = "Spumante";
            switch (result[i]["vinificazione"]) {
                case "fermo":
                    vs_option_1.selected = true;
                    break;
                case "frizzante":
                    vs_option_2.selected = true;
                    break;
                case "spumante":
                    vs_option_3.selected = true;
                    break;
            }
            vinificazione_select.appendChild(vs_option_1);
            vinificazione_select.appendChild(vs_option_2);
            vinificazione_select.appendChild(vs_option_3);
            vinificazione.appendChild(vinificazione_select);
            tr.appendChild(vinificazione);
            let colore = document.createElement("td");
            let colore_select = document.createElement("select");
            colore_select.name = "colore";
            let cs_option_1 = document.createElement("option");
            cs_option_1.value = "rosso";
            cs_option_1.innerHTML = "Rosso";
            let cs_option_2 = document.createElement("option");
            cs_option_2.value = "bianco";
            cs_option_2.innerHTML = "Bianco";
            let cs_option_3 = document.createElement("option");
            cs_option_3.value = "rose";
            cs_option_3.innerHTML = "Rosé";
            switch (result[i]["colore"]) {
                case "rosso":
                    cs_option_1.selected = true;
                    break;
                case "bianco":
                    cs_option_2.selected = true;
                    break;
                case "rose":
                    cs_option_3.selected = true;
                    break;
            }
            colore_select.appendChild(cs_option_1);
            colore_select.appendChild(cs_option_2);
            colore_select.appendChild(cs_option_3);
            colore.appendChild(colore_select);
            tr.appendChild(colore);
            let macerato = document.createElement("td");
            let macerato_check = document.createElement("input");
            macerato_check.setAttribute("type", "checkbox");
            if (result[i]["macerato"] === 1)
                macerato_check.click();
            macerato.appendChild(macerato_check);
            tr.appendChild(macerato);
            let listino = document.createElement("td");
            let listino_check = document.createElement("input");
            listino_check.setAttribute("type", "checkbox");
            if (result[i]["listino"] === 1)
                listino_check.click();
            listino.appendChild(listino_check);
            tr.appendChild(listino);
            tbody.appendChild(tr);
        }
        db_table.appendChild(tbody);
    });
});