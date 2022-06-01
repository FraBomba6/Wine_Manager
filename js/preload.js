const electron = require("electron")
const ipc = electron.ipcRenderer;

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./vini.db"
    },
    useNullAsDefault: true
});

let producerArray = [];
let producerSelect = null;

let blockEvent = false;
let currentWineName = "";
let currentWineYear = "";
let currentWineProducer = "";
let currentProducerName = "";

function updateCurrentWine(event) {
    let row = event.target.parentNode.parentNode;
    currentWineName = row.querySelector("[name='name']").value;
    currentWineYear = row.querySelector("[name='year']").value;
    currentWineProducer = row.querySelector("[name='producer']").value;
}

function updateCurrentProducer(event) {
    let checkInterval = setInterval(() => {
        if (!blockEvent) {
            currentProducerName = event.target.parentNode.parentNode.querySelector("[name='name']").value;
            clearInterval(checkInterval);
        }
    }, 1);
}

function generate_select_option(value, toUpper=false) {
    let option = document.createElement("option");
    option.value = value;
    if (toUpper)
        value = value[0].toUpperCase() + value.slice(1)
    option.innerHTML = value;
    return option;
}

function generate_table_cell_with_content(contentNode, type="wine") {
    let td = document.createElement("td");
    if (type === "wine")
        contentNode.addEventListener('change', commitWineChanges);
    else
        contentNode.addEventListener('change', commitProducerChanges);
    td.appendChild(contentNode);
    return td;
}

function generate_input_text_element(name, value) {
    let input = document.createElement("textarea");
    input.name = name;
    input.value = value;
    return input;
}

function generate_delete_button(value, className) {
    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = value;
    deleteButton.classList.add(className);
    if (className === "deleteWine")
        deleteButton.addEventListener('click', deleteWine);
    else
        deleteButton.addEventListener('click', deleteProducer);
    return deleteButton;
}

function generate_wine_tbl_header(queryResult) {
    let db_table = document.getElementById("viniDb");
    let thead = document.createElement("thead");
    let row = document.createElement("tr");
    for (let i = 0; i < queryResult.length; i++) {
        let heading = document.createElement('th');
        heading.classList.add(queryResult[i]["name"] + "Header");
        heading.innerHTML = queryResult[i]["name"];
        row.appendChild(heading);
    }
    let heading = document.createElement('th');
    heading.id = "eliminaHeader";
    heading.innerHTML = "Elimina";
    row.appendChild(heading);
    thead.appendChild(row);
    db_table.appendChild(thead);
}

function generate_producer_list_and_select(queryResult) {
    producerSelect = document.createElement("select");
    producerSelect.name = "producer";
    for(let i = 0; i < queryResult.length; i++) {
        producerArray.push(queryResult[i]["nome"]);
        producerSelect.appendChild(generate_select_option(producerArray[i]));
    }
}

function generate_producer_tbl_body(queryResult) {
    let tbody = document.getElementById("cantinaDbBody");
    for (let i = 0; i < queryResult.length; i++) {
        let tr = document.createElement("tr");
        tr.addEventListener("focusin", updateCurrentProducer);
        let nameTd = generate_table_cell_with_content(generate_input_text_element("name", queryResult[i]["nome"]), "producer");
        let stateTd = generate_table_cell_with_content(generate_input_text_element("state", queryResult[i]["stato"]), "producer");
        let regionTd = generate_table_cell_with_content(generate_input_text_element("region", queryResult[i]["regione"]), "producer");
        tr.appendChild(nameTd);
        tr.appendChild(stateTd);
        tr.appendChild(regionTd);
        let tdDelete = generate_table_cell_with_content(generate_delete_button("Elimina", "deleteProducer"));
        tr.appendChild(tdDelete);
        tbody.appendChild(tr);
    }
}

function generate_wine_tbl_body(queryResult) {
    let dbTbl = document.getElementById("viniDb");
    let tbody = document.createElement("tbody");

    for (let i = 0; i < queryResult.length; i++) {
        let tr = document.createElement("tr");
        tr.addEventListener("focusin", updateCurrentWine);
        let nameTd = generate_table_cell_with_content(generate_input_text_element("name", queryResult[i]["nome"]));
        tr.appendChild(nameTd);

        let yearInput = document.createElement("input");
        yearInput.type = "number";
        yearInput.name = "year";
        yearInput.value = queryResult[i]["annata"];
        let yearTd = generate_table_cell_with_content(yearInput)
        tr.appendChild(yearTd);

        let producerSelectCopy = producerSelect.cloneNode(true);
        producerSelectCopy.value = queryResult[i]["cantina"];
        let producerTd = generate_table_cell_with_content(producerSelectCopy);
        tr.appendChild(producerTd);

        let priceTd = generate_table_cell_with_content(generate_input_text_element("price", queryResult[i]["prezzo"]));
        tr.appendChild(priceTd);

        let typeSelect = document.createElement("select");
        typeSelect.name = "type";
        let typeSelectOption1 = generate_select_option("fermo", true);
        let typeSelectOption2 = generate_select_option("frizzante", true);
        let typeSelectOption3 = generate_select_option("spumante", true);
        switch (queryResult[i]["vinificazione"]) {
            case "fermo":
                typeSelectOption1.selected = true;
                break;
            case "frizzante":
                typeSelectOption2.selected = true;
                break;
            case "spumante":
                typeSelectOption3.selected = true;
                break;
        }
        typeSelect.appendChild(typeSelectOption1);
        typeSelect.appendChild(typeSelectOption2);
        typeSelect.appendChild(typeSelectOption3);
        let typeTd = generate_table_cell_with_content(typeSelect);
        tr.appendChild(typeTd);

        let colorSelect = document.createElement("select");
        colorSelect.name = "color";

        let colorSelectOption1 = generate_select_option("rosso", true);
        let colorSelectOption2 = generate_select_option("bianco", true);
        let colorSelectOption3 = generate_select_option("rosé", true);
        switch (queryResult[i]["colore"]) {
            case "rosso":
                colorSelectOption1.selected = true;
                break;
            case "bianco":
                colorSelectOption2.selected = true;
                break;
            case "rose":
                colorSelectOption3.selected = true;
                break;
        }
        colorSelect.appendChild(colorSelectOption1);
        colorSelect.appendChild(colorSelectOption2);
        colorSelect.appendChild(colorSelectOption3);
        let colorTd = generate_table_cell_with_content(colorSelect);
        tr.appendChild(colorTd);

        let maceratedCheck = document.createElement("input");
        maceratedCheck.name = "macerated";
        maceratedCheck.setAttribute("type", "checkbox");
        if (queryResult[i]["macerato"] === 1)
            maceratedCheck.click();
        let maceratedTd = generate_table_cell_with_content(maceratedCheck);
        tr.appendChild(maceratedTd);

        let inListCheck = document.createElement("input");
        inListCheck.name = "inList"
        inListCheck.setAttribute("type", "checkbox");
        if (queryResult[i]["listino"] === 1)
            inListCheck.click();
        let inListTd = generate_table_cell_with_content(inListCheck);
        tr.appendChild(inListTd);

        let deleteTd = generate_table_cell_with_content(generate_delete_button("Elimina", "deleteWine"));
        tr.appendChild(deleteTd);

        tbody.appendChild(tr);
    }
    dbTbl.appendChild(tbody);
}

document.addEventListener("DOMContentLoaded", function(){
    if (document.body.contains(document.getElementById("viniDb"))) {
        let headers = knex.raw("PRAGMA table_info(vini);");
        headers.then((rows) => {
            generate_wine_tbl_header(rows)
        });
    }
    let producers = knex("cantina").select("*").orderBy("nome");
    producers.then((rows) => {
        generate_producer_list_and_select(rows);
        if (document.body.contains(document.getElementById("cantinaDbContainer"))) {
            generate_producer_tbl_body(rows);
            document.dispatchEvent(new Event('producerTblCreated'));
        }
    });
    if (document.body.contains(document.getElementById("viniDb"))) {
        let wines = knex("vini").select("*").orderBy("nome");
        wines.then((rows) => {
            generate_wine_tbl_body(rows);
            append_producer_select();
            document.dispatchEvent(new Event('wineTblCreated'));
        });
    }
});

function append_producer_select() {
    let newWineProducerTd = document.getElementById("newWineProducerTd");  //TODO move these two lines
    let newWineProducerSelect = producerSelect.cloneNode(true);
    newWineProducerSelect.id = "newWineProducer";
    newWineProducerTd.appendChild(newWineProducerSelect);
}

document.addEventListener("wineTblCreated", attachWineEventListener);
document.addEventListener("producerTblCreated", attachProducerEventListener);

function attachWineEventListener() {
    let addNewWineButton = document.getElementById("newWineAdd");
    addNewWineButton.addEventListener('click', addNewWine);
}

function attachProducerEventListener() {
    let addNewProducerButton = document.getElementById("newProducerAdd");
    addNewProducerButton.addEventListener('click', addNewProducer);
}

function deleteWine(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    let year = row.querySelector("[name='year']").value;
    let producer = row.querySelector("[name='producer']").value;

    knex("vini").where({
        nome: name,
        annata: year,
        cantina: producer
    }).del().then(() => ipc.send('force_reload'));
}

function addNewWine() {
    let name = document.getElementById('newWineName').value;
    let year = document.getElementById('newWineYear').value;
    let producer = document.getElementById('newWineProducer').value;
    let price = document.getElementById('newWinePrice').value;
    let type = document.getElementById('newWineType').value;
    let color = document.getElementById('newWineColor').value;
    let macerated = document.getElementById('newWineMacerated').checked;

    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("vini").insert({
            nome: name,
            annata: year,
            cantina: producer,
            prezzo: price,
            vinificazione: type,
            colore: color,
            macerato: macerated,
            listino: 1
        }).then(() => ipc.send('force_reload')).catch(manageError);
    });
}

function commitWineChanges(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    let year = row.querySelector("[name='year']").value;
    let producer = row.querySelector("[name='producer']").value;
    let updateQuery = {}
    switch (event.target.name) {
        case "name":
            updateQuery["nome"] = name;
            break;
        case "year":
            updateQuery["annata"] = year;
            break;
        case "producer":
            updateQuery["cantina"] = producer;
            break;
        case "price":
            updateQuery["prezzo"] = row.querySelector("[name='price']").value;
            break;
        case "type":
            updateQuery["vinificazione"] = row.querySelector("[name='type']").value;
            break;
        case "color":
            updateQuery["colore"] = row.querySelector("[name='color']").value;
            break;
        case "macerated":
            updateQuery["macerato"] = row.querySelector("[name='macerated']").checked;
            break;
        case "inList":
            updateQuery["listino"] = row.querySelector("[name='inList']").checked;
            break;
    }
    knex("vini").where({
        nome: currentWineName,
        annata: currentWineYear,
        cantina: currentWineProducer
    }).update(updateQuery).then();
}

function deleteProducer(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("cantina").where({
            nome: name
        }).del().then(() => ipc.send('force_reload'));
    });
}

function addNewProducer() {
    let name = document.getElementById('newProducerName').value;
    let state = document.getElementById('newProducerState').value;
    let region = document.getElementById('newProducerRegion').value;

    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("cantina").insert({
            nome: name,
            stato: state,
            regione: region
        }).then(() => ipc.send('force_reload'));
    });
}

function commitProducerChanges(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    let updateQuery = {}
    switch (event.target.name) {
        case "name":
            updateQuery["nome"] = name;
            break;
        case "state":
            updateQuery["stato"] = row.querySelector("[name='state']").value;
            break;
        case "region":
            updateQuery["regione"] = row.querySelector("[name='region']").value;
            break;
    }
    blockEvent = true;
    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("cantina").where({
            nome: currentProducerName
        }).update(updateQuery).then(() => blockEvent = false);
    });
}

function manageError(error) {
    if (error.errno === 19) {
        let td = document.getElementById("newWineError");
        td.innerHTML = "Errore! Esiste già un vino con questo nome, questo anno e questa cantina";
        td.classList.toggle("fadeOut");
        setTimeout(() => {
            td.classList.toggle("fadeOut");
            td.innerHTML = "";
        }, 9000);
    }
}