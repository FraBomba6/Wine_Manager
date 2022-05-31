const electron = require("electron")
const ipc = electron.ipcRenderer;

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./vini.db"
    }
});

let producerArray = [];

function generate_select_option(value, toUpper=false) {
    let option = document.createElement("option");
    option.value = value;
    if (toUpper)
        value = value[0].toUpperCase() + value.slice(1)
    option.innerHTML = value;
    return option;
}

function generate_table_cell_with_content(contentNode) {
    let td = document.createElement("td");
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

function generate_producer_tbl_body(queryResult) {
    for(let i = 0; i < queryResult.length; i++) {
        producerArray.push(queryResult[i]["nome"]);
    }
    if (document.body.contains(document.getElementById("cantinaDbBody"))) {
        let tbody = document.getElementById("cantinaDbBody");
        for (let i = 0; i < queryResult.length; i++) {
            let tr = document.createElement("tr");
            let nameTd = generate_table_cell_with_content(generate_input_text_element("name", queryResult[i]["nome"]));
            let stateTd = generate_table_cell_with_content(generate_input_text_element("state", queryResult[i]["stato"]));
            let regionTd = generate_table_cell_with_content(generate_input_text_element("region", queryResult[i]["regione"]));
            tr.appendChild(nameTd);
            tr.appendChild(stateTd);
            tr.appendChild(regionTd);
            let tdDelete = generate_table_cell_with_content(generate_delete_button("Elimina", "deleteProducer"));
            tr.appendChild(tdDelete);
            tbody.appendChild(tr);
        }
    }
}

function generate_wine_tbl_body(queryResult) {
    let dbTbl = document.getElementById("viniDb");
    let tbody = document.createElement("tbody");

    let producerSelect = document.createElement("select");
    producerSelect.name = "producer";
    for (let i = 0; i < producerArray.length; i++)
        producerSelect.appendChild(generate_select_option(producerArray[i]));

    let newWineProducer_td = document.getElementById("newWineProducer");  //TODO move these two lines
    newWineProducer_td.appendChild(producerSelect.cloneNode(true));

    for (let i = 0; i < queryResult.length; i++) {
        let tr = document.createElement("tr");
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
        colorSelect.name = "colore";

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
        maceratedCheck.setAttribute("type", "checkbox");
        if (queryResult[i]["macerato"] === 1)
            maceratedCheck.click();
        let maceratedTd = generate_table_cell_with_content(maceratedCheck);
        tr.appendChild(maceratedTd);

        let inListCheck = document.createElement("input");
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
        generate_producer_tbl_body(rows)
    });
    if (document.body.contains(document.getElementById("viniDb"))) {
        let wines = knex("vini").select("*");
        wines.then((rows) => {
            generate_wine_tbl_body(rows);
            document.dispatchEvent(new Event('tblCreated'));
        });
    }
});

document.addEventListener("tblCreated", attachEventListeners);

function attachEventListeners() {
    let addNewWineButton = document.getElementById("newWineAdd");
    addNewWineButton.addEventListener('click', addNewWine);

    let deleteButtons = document.getElementsByClassName("deleteWine");
    Array.from(deleteButtons).forEach((button) => {
        button.addEventListener('click', deleteWine);
    });
}

function deleteWine(event) {
    let row = event.target.parentNode.parentNode
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
    let macerated = document.getElementById('newWineMacerated').value;
}