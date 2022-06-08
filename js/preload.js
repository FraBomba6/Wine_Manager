const electron = require("electron");
const ipc = electron.ipcRenderer;

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./results/vini.db"
    },
    useNullAsDefault: true
});

let wineryArray = [];
let winerySelect = null;

let multiSelect = null;

let blockEvent = false;
let currentWineName = "";
let currentWineYear = "";
let currentWineWinery = "";
let currentWineryName = "";
let currentFormName = "";

function updateCurrentWine(event) {
    let checkInterval = setInterval(() => {
        if (!blockEvent) {
            let row = event.target.parentNode.parentNode;
            currentWineName = row.querySelector("[name='name']").value;
            currentWineYear = row.querySelector("[name='year']").value;
            currentWineWinery = row.querySelector("[name='winery']").value;
            clearInterval(checkInterval);
        }
    }, 1);
}

function updateCurrentWinery(event) {
    let checkInterval = setInterval(() => {
        if (!blockEvent) {
            currentWineryName = event.target.parentNode.parentNode.querySelector("[name='name']").value;
            clearInterval(checkInterval);
        }
    }, 1);
}

function updateCurrentForm(event) {
    let checkInterval = setInterval(() => {
        if (!blockEvent) {
            let form = event.target.parentNode;
            while (form.nodeName !== "FORM")
                form = form.parentNode;
            currentFormName = form.querySelector("[name='categoryName']").value;
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
        contentNode.addEventListener('change', commitWineryChanges);
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
        deleteButton.addEventListener('click', deleteWinery);
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

function generate_winery_list_and_select(queryResult) {
    winerySelect = document.createElement("select");
    winerySelect.name = "winery";
    for(let i = 0; i < queryResult.length; i++) {
        wineryArray.push(queryResult[i]["nome"]);
        winerySelect.appendChild(generate_select_option(wineryArray[i]));
    }
}

function generate_winery_tbl_body(queryResult) {
    let tbody = document.getElementById("cantinaDbBody");
    for (let i = 0; i < queryResult.length; i++) {
        let tr = document.createElement("tr");
        tr.addEventListener("focusin", updateCurrentWinery);
        let nameTd = generate_table_cell_with_content(generate_input_text_element("name", queryResult[i]["nome"]), "winery");
        let stateTd = generate_table_cell_with_content(generate_input_text_element("state", queryResult[i]["stato"]), "winery");
        let regionTd = generate_table_cell_with_content(generate_input_text_element("region", queryResult[i]["regione"]), "winery");
        tr.appendChild(nameTd);
        tr.appendChild(stateTd);
        tr.appendChild(regionTd);
        let tdDelete = generate_table_cell_with_content(generate_delete_button("Elimina", "deleteWinery"));
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

        let winerySelectCopy = winerySelect.cloneNode(true);
        winerySelectCopy.value = queryResult[i]["cantina"];
        let wineryTd = generate_table_cell_with_content(winerySelectCopy);
        tr.appendChild(wineryTd);

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
    if (!document.body.contains(document.getElementById("formContainer"))) {
        let winerys = knex("cantina").select("*").orderBy("nome");
        winerys.then((rows) => {
            generate_winery_list_and_select(rows);
            if (document.body.contains(document.getElementById("cantinaDbContainer"))) {
                generate_winery_tbl_body(rows);
                document.dispatchEvent(new Event('wineryTblCreated'));
            }
        });
    } else if (!document.body.contains(document.getElementById("page_1"))) {
        knex("vini")
            .join('cantina', 'vini.cantina', 'cantina.nome')
            .select("vini.nome", "annata", "vini.cantina", "cantina.stato", "cantina.regione", "vinificazione", "colore")
            .where({listino: 1})
            .orderBy("vini.nome")
            .then(populateMultiSelect);
        knex("categorie").select('*').then(generate_category_page);
        document.dispatchEvent(new Event('categoryPageCreated'));
    }
    if (document.body.contains(document.getElementById("viniDb"))) {
        let wines = knex("vini").select("*").orderBy("nome");
        wines.then((rows) => {
            generate_wine_tbl_body(rows);
            append_winery_select();
            document.dispatchEvent(new Event('wineTblCreated'));
        });
    }

    if (document.body.contains(document.getElementById("final-document"))) {
        let print = document.getElementById("print");
        print.addEventListener('click', () => {
            ipc.send('print');
        })
        knex("categorie").select('*').orderBy('posizione').then((categories) => {
            knex("vini_categoria").count("nome_vino as n").then((result) => {
                generate_printable_page(categories, categories.length, result[0].n)
            })
        });
    }
});

function append_winery_select() {
    let newWineWineryTd = document.getElementById("newWineWineryTd");
    let newWineWinerySelect = winerySelect.cloneNode(true);
    newWineWinerySelect.id = "newWineWinery";
    newWineWineryTd.appendChild(newWineWinerySelect);
}

document.addEventListener("wineTblCreated", attachWineEventListener);
document.addEventListener("wineryTblCreated", attachWineryEventListener);
document.addEventListener("categoryPageCreated", attachCategoryEventListeners);

function attachWineEventListener() {
    let addNewWineButton = document.getElementById("newWineAdd");
    addNewWineButton.addEventListener('click', addNewWine);
}

function attachWineryEventListener() {
    let addNewWineryButton = document.getElementById("newWineryAdd");
    addNewWineryButton.addEventListener('click', addNewWinery);
}

function attachCategoryEventListeners() {
    let addFormButton = document.getElementById("addFormButton");
    addFormButton.addEventListener('click', () => addNewForm());
}

function generate_category_page(queryResult) {
    for (let i = 0; i < queryResult.length; i++)
        knex("vini_categoria").select('*').where({categoria: queryResult[i]["nome"]}).then((rows) => {
            addNewForm(true);
            let formId = "form" + (i + 1);
            let form = document.getElementById(formId);
            form.querySelector("[name='categoryName']").value = queryResult[i]["nome"];
            form.querySelector("#position").value = queryResult[i]["posizione"];
            if (rows.length > 0) {
                for (let j = 0; j < rows.length; j++) {
                    knex("vini").select('annata').where({nome: rows[j]["nome_vino"], cantina: rows[j]["cantina_vino"]}).then((row) => {
                        let annata = row[0]['annata'];
                        let wine_name = rows[j]["nome_vino"];
                        if (annata !== null)
                            wine_name += ", " + annata;
                        wine_name += ", " + rows[j]["cantina_vino"];
                        wine_name = wine_name.replaceAll("'", "\'");
                        wine_name = wine_name.replaceAll('"', "\\\"");
                        let selector = "[data-value*=\"" + wine_name + "\"]";
                        form.querySelector(selector).click();
                    });
                }
            }
        });
}

function populateMultiSelect(queryResult) {
    multiSelect = document.createElement("select");
    multiSelect.id = "multiselect";
    multiSelect.multiple = true;
    for (let i = 0; i < queryResult.length; i++) {
        let value;
        if (queryResult[i]["annata"] !== null)
            value = queryResult[i]["nome"] + ", " + queryResult[i]["annata"] + ", " + queryResult[i]["cantina"];
        else
            value = queryResult[i]["nome"] + ", " + queryResult[i]["cantina"];
        let selectOption = generate_select_option(value);
        selectOption.value = value + ", " + queryResult[i]["vinificazione"] + ", " + queryResult[i]["colore" ] + ", " + queryResult[i]["stato"] + ", " + queryResult[i]["regione"];
        multiSelect.appendChild(selectOption);
    }
}

function generateMultiSelect (parent) {
    let element = multiSelect.cloneNode(true);
    parent.appendChild(element)
    multi(element, {
        "enable_search": true,
        "search_placeholder": "Cerca...",
        "non_selected_header": "Vini selezionabili",
        "selected_header": "Vini scelti",
        "limit": -1,
        "limit_reached": function () {},
        "hide_empty_groups": false,
    });
}

function addNewForm(inserted = false) {
    let div = document.getElementById("formContainer");
    let form = document.getElementById("form0");
    let currentProgressiveNumber = parseInt(div.children[div.children.length - 2].id.replace( /^\D+/g, ''));
    let newForm = form.cloneNode(true);
    let formName = "Categoria_" + (currentProgressiveNumber + 1);
    newForm.reset();
    newForm.id = "form" + (currentProgressiveNumber + 1);
    newForm.addEventListener('focusin', updateCurrentForm);
    newForm.querySelector("[id='categoryName']").addEventListener('change', commitFormChanges);
    newForm.querySelector("[id='categoryName']").value = formName;
    generateMultiSelect(newForm.querySelector("[id='multiple-select-fieldset']"));
    newForm.querySelector("[class='non-selected-wrapper']").addEventListener('click', commitFormChanges);
    newForm.querySelector("[class='selected-wrapper']").addEventListener('click', commitFormChanges);
    newForm.querySelector("[id='removeCategory']").addEventListener('click', deleteForm);
    newForm.querySelector("#position").value = currentProgressiveNumber + 1;
    newForm.querySelector("#position").addEventListener('change', commitFormChanges);
    div.insertBefore(newForm, div.children[div.children.length - 1]);
    if (!inserted) {
        knex("categorie").insert({nome: formName, posizione: currentProgressiveNumber + 1}).then();
    }
}

function commitFormChanges(event) {
    if (event.target.className === "item" && event.pointerId !== -1) {
        let wine = event.target.innerHTML.split(",");
        for (let i = 0; i < wine.length; i++)
            wine[i] = wine[i].trim();
        let dict = {}
        if (wine.length < 3) {
            dict["nome_vino"] = wine[0];
            dict["cantina_vino"] = wine[1];
        } else {
            dict["nome_vino"] = wine[0];
            dict["cantina_vino"] = wine[2];
        }
        dict["categoria"] = currentFormName
        knex("vini_categoria").insert(dict).then();
    }
    else if (event.target.className === "item selected" && event.pointerId !== -1) {
        let wine = event.target.innerHTML.split(",");
        for (let i = 0; i < wine.length; i++)
            wine[i] = wine[i].trim();
        let dict = {}
        if (wine.length < 3) {
            dict["nome_vino"] = wine[0];
            dict["cantina_vino"] = wine[1];
        } else {
            dict["nome_vino"] = wine[0];
            dict["cantina_vino"] = wine[2];
        }
        dict["categoria"] = currentFormName
        knex("vini_categoria").where(dict).del().then();
    }
    else if (event.target.id ==='categoryName') {
        blockEvent = true;
        knex.raw("PRAGMA foreign_keys = ON;").then(() => knex("categorie").where({
            nome: currentFormName
        }).update({nome: event.target.value}).then(() => blockEvent = false));
    }
    else if (event.target.id === "position") {
        blockEvent = true;
        knex.raw("PRAGMA foreign_keys = ON;").then(() => knex("categorie").where({
            nome: currentFormName
        }).update({posizione: event.target.value}).then(() => blockEvent = false));
    }
}

function deleteForm(event) {
    let form = event.target.parentNode.parentNode;
    let name = form.querySelector("[name='categoryName']").value;
    if (name !== "")
        knex.raw("PRAGMA foreign_keys = ON;").then(() => {
            knex("categorie").where({nome: name}).del().then(form.remove());
        });
    else
        form.remove();
}

function deleteWine(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    let year = row.querySelector("[name='year']").value;
    let winery = row.querySelector("[name='winery']").value;

    knex("vini").where({
        nome: name,
        annata: year,
        cantina: winery
    }).del().then(() => ipc.send('force_reload'));
}

function addNewWine() {
    let name = document.getElementById('newWineName').value;
    let year = document.getElementById('newWineYear').value;
    let winery = document.getElementById('newWineWinery').value;
    let price = document.getElementById('newWinePrice').value;
    let type = document.getElementById('newWineType').value;
    let color = document.getElementById('newWineColor').value;
    let macerated = document.getElementById('newWineMacerated').checked;

    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("vini").insert({
            nome: name,
            annata: year,
            cantina: winery,
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
    let updateQuery = {}
    switch (event.target.name) {
        case "name":
            let name = row.querySelector("[name='name']").value;
            updateQuery["nome"] = name;
            break;
        case "year":
            updateQuery["annata"] = row.querySelector("[name='year']").value;
            break;
        case "winery":
            updateQuery["cantina"] = row.querySelector("[name='winery']").value;
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
    blockEvent = true;
    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        let query;
        query = knex("vini").where({
            nome: currentWineName,
            cantina: currentWineWinery
        }).update(updateQuery);
        query.then(() => blockEvent = false);
    });
}

function deleteWinery(event) {
    let row = event.target.parentNode.parentNode;
    let name = row.querySelector("[name='name']").value;
    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("cantina").where({
            nome: name
        }).del().then(() => ipc.send('force_reload'));
    });
}

function addNewWinery() {
    let name = document.getElementById('newWineryName').value;
    let state = document.getElementById('newWineryState').value;
    let region = document.getElementById('newWineryRegion').value;

    knex.raw("PRAGMA foreign_keys = ON;").then(() => {
        knex("cantina").insert({
            nome: name,
            stato: state,
            regione: region
        }).then(() => ipc.send('force_reload'));
    });
}

function commitWineryChanges(event) {
    let row = event.target.parentNode.parentNode;
    let updateQuery = {}
    switch (event.target.name) {
        case "name":
            updateQuery["nome"] = row.querySelector("[name='name']").value;
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
            nome: currentWineryName
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

function generate_printable_page(queryResult, nCategories, nEntries) {
    const PAGES = compute_pages_number()
    const COLUMNS = PAGES * 4
    let columnCounter = 1
    let pageCounter = 1
    let colCounter = 2;
    let rowCounter = 0;
    let effectiveRows = 0;
    const MAXROWS = 37;
    // let page = document.createElement("div");
    // page.classList.toggle("page");
    // let pageGrid = document.createElement("div");
    // pageGrid.classList.toggle("grid-container");
    // page.appendChild(pageGrid);
    // document.body.appendChild(page);
    create_pages()
    let itTitle = document.getElementById("it-title");
    let itBody = document.getElementById("it-body");
    let enTitle = document.getElementById("en-title");
    let enBody = document.getElementById("en-body");
    let pageGrid = document.getElementById("pageGrid-1");
    pageGrid.appendChild(itTitle);
    pageGrid.appendChild(itBody);
    pageGrid.appendChild(enTitle);
    pageGrid.appendChild(enBody);

    function compute_pages_number() {
        return Math.ceil((Math.ceil((nCategories * 3 + nEntries) / 37) + 1) / 4)
    }

    function create_pages() {
        for (let i = 0; i < PAGES * 2 ; i++) {
            let page = document.createElement("div");
            page.classList.toggle("page");
            page.id = "page-" + (i + 1);
            let pageGrid = document.createElement("div");
            pageGrid.classList.toggle("grid-container");
            pageGrid.id = "pageGrid-" + (i + 1);
            page.appendChild(pageGrid);
            document.body.appendChild(page);
        }
    }

    function change_column() {
        if (colCounter === 1)
            colCounter = 2;
        else
            colCounter = 1;
    }

    function reset_row() {
        rowCounter = 0;
        effectiveRows = 0;
    }

    function evaluate_row_status(param) {
        if (rowCounter > param) {
            columnCounter += 1;
            change_column();
            if (columnCounter <= COLUMNS / 2) {
                pageCounter += 1
                pageGrid = document.getElementById("pageGrid-" + pageCounter)
            } else if (columnCounter > 1 + COLUMNS / 2) {
                pageCounter -= 1
                pageGrid = document.getElementById("pageGrid-" + pageCounter)
            }
            reset_row();
            return true;
        }
        return false;
    }

    queryResult.forEach((category) => {
        let gridCellTitle = document.createElement("div");
        gridCellTitle.textContent = category.nome;
        gridCellTitle.classList.toggle("title-cell");
        let borderImg = document.createElement("img");
        borderImg.src = "../imgs/title_border.png";
        borderImg.id = "border-img";
        knex.select("vini.nome as nome", "vini.annata as annata", "vini.cantina as cantina", "vini.prezzo as prezzo", "vini_categoria.categoria as categoria", "cantina.stato as stato", "cantina.regione as regione")
            .from("vini_categoria")
            .join("vini", function () {
                this
                    .on("vini.nome", "=", "vini_categoria.nome_vino")
                    .andOn("vini.cantina", "=", "vini_categoria.cantina_vino")
            })
            .join("cantina", "vini.cantina", "cantina.nome")
            .where({categoria: category.nome})
            .orderBy(["cantina", "prezzo"])
            .then((rows) => {
                evaluate_row_status(MAXROWS - 3);
                if (pageCounter === 1) {
                    gridCellTitle.style.margin = "3px 0";
                    borderImg.style.marginBottom = "23px";
                }
                gridCellTitle.style.gridColumn = "" + colCounter;
                borderImg.style.gridColumn = "" + colCounter;
                gridCellTitle.style.gridRow = "" + ++rowCounter;
                pageGrid.appendChild(gridCellTitle);
                borderImg.style.gridRow = "" + ++rowCounter;
                pageGrid.appendChild(borderImg);
                effectiveRows += 1;
                rows.forEach((row) => {
                    evaluate_row_status(MAXROWS - 1);
                    let gridCell = document.createElement("div");
                    gridCell.style.gridColumn = "" + colCounter;
                    gridCell.classList.toggle("subgrid-container");
                    let subgridCellRow1 = document.createElement("div");
                    if (row.annata !== null)
                        subgridCellRow1.textContent = row.nome + " " + row.annata;
                    else
                        subgridCellRow1.textContent = row.nome;
                    subgridCellRow1.classList.toggle("wine-cell");
                    subgridCellRow1.style.height = "15px";
                    gridCell.appendChild(subgridCellRow1);
                    let subgridCellRow2 = document.createElement("div");
                    subgridCellRow2.classList.toggle("producer-cell");
                    subgridCellRow2.textContent = row.cantina + " - " + row.regione + ", " + row.stato;
                    subgridCellRow2.style.height = "11px";
                    gridCell.appendChild(subgridCellRow2);
                    let subgridCellPrice = document.createElement("div");
                    subgridCellPrice.classList.toggle("price-cell");
                    subgridCellPrice.textContent = "€ " + parseFloat(row.prezzo).toFixed(2);
                    gridCell.appendChild(subgridCellPrice);

                    gridCell.style.gridRow = "" + ++rowCounter;
                    effectiveRows += 1;
                    pageGrid.appendChild(gridCell);
                });
                if (!evaluate_row_status(MAXROWS - 4)) {
                    let emptyCell = document.createElement("div");
                    emptyCell.classList.toggle("empty-cell");
                    emptyCell.style.gridColumn = "" + colCounter;
                    emptyCell.style.gridRow = "" + ++rowCounter;
                    pageGrid.appendChild(emptyCell);
                    effectiveRows += 1;
                }
            });
    });

}

var multi = (function() {
    var disabled_limit = false; // This will prevent to reset the "disabled" because of the limit at every click

    // Helper function to trigger an event on an element
    var trigger_event = function(type, el) {
        var e = document.createEvent("HTMLEvents");
        e.initEvent(type, false, true);
        el.dispatchEvent(e);
    };

    // Check if there is a limit and if is reached
    var check_limit = function (select, settings) {
        var limit = settings.limit;
        if (limit > -1) {
            // Count current selected
            var selected_count = 0;
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].selected) {
                    selected_count++;
                }
            }

            // Reached the limit
            if (selected_count === limit) {
                this.disabled_limit = true;

                // Trigger the function (if there is)
                if (typeof settings.limit_reached === "function") {
                    settings.limit_reached();
                }

                // Disable all non-selected option
                for (var i = 0; i < select.options.length; i++) {
                    var opt = select.options[i];

                    if (!opt.selected) {
                        opt.setAttribute("disabled", true);
                    }
                }
            } else if (this.disabled_limit) {
                // Enable options (only if they weren't disabled on init)
                for (var i = 0; i < select.options.length; i++) {
                    var opt = select.options[i];

                    if (opt.getAttribute("data-origin-disabled") === "false") {
                        opt.removeAttribute("disabled");
                    }
                }

                this.disabled_limit = false;
            }
        }
    };

    // Toggles the target option on the select
    var toggle_option = function(select, event, settings) {
        var option = select.options[event.target.getAttribute("multi-index")];

        if (option.disabled) {
            return;
        }

        option.selected = !option.selected;

        check_limit(select, settings);

        trigger_event("change", select);
    };

    // Refreshes an already constructed multi.js instance
    var refresh_select = function(select, settings) {
        // Clear columns
        select.wrapper.selected.innerHTML = "";
        select.wrapper.non_selected.innerHTML = "";

        // Add headers to columns
        if (settings.non_selected_header && settings.selected_header) {
            var non_selected_header = document.createElement("div");
            var selected_header = document.createElement("div");

            non_selected_header.className = "header";
            selected_header.className = "header";

            non_selected_header.innerText = settings.non_selected_header;
            selected_header.innerText = settings.selected_header;

            select.wrapper.non_selected.appendChild(non_selected_header);
            select.wrapper.selected.appendChild(selected_header);
        }

        // Get search value
        if (select.wrapper.search) {
            var query = select.wrapper.search.value;
        }

        // Current group
        var item_group = null;
        var current_optgroup = null;

        // Loop over select options and add to the non-selected and selected columns
        for (var i = 0; i < select.options.length; i++) {
            var option = select.options[i];

            var value = option.value;
            var label = option.textContent || option.innerText;

            var row = document.createElement("a");
            row.tabIndex = 0;
            row.className = "item";
            row.innerText = label;
            row.setAttribute("role", "button");
            row.setAttribute("data-value", value);
            row.setAttribute("multi-index", i);

            if (option.disabled) {
                row.className += " disabled";
            }

            // Add row to selected column if option selected
            if (option.selected) {
                row.className += " selected";
                var clone = row.cloneNode(true);
                select.wrapper.selected.appendChild(clone);
            }

            // Create group if entering a new optgroup
            if (
                option.parentNode.nodeName == "OPTGROUP" &&
                option.parentNode != current_optgroup
            ) {
                current_optgroup = option.parentNode;
                item_group = document.createElement("div");
                item_group.className = "item-group";

                if (option.parentNode.label) {
                    var groupLabel = document.createElement("span");
                    groupLabel.innerHTML = option.parentNode.label;
                    groupLabel.className = "group-label";
                    item_group.appendChild(groupLabel);
                }

                select.wrapper.non_selected.appendChild(item_group);
            }

            // Clear group if not inside optgroup
            if (option.parentNode == select) {
                item_group = null;
                current_optgroup = null;
            }

            function evaluateQuery(query) {
                if (!query)
                    return true;
                return !!query.split(" ").every(item => {
                    if (item.indexOf("-") <= -1)
                        return value.toLowerCase().indexOf(item.toLowerCase()) > -1
                    else {
                        item = item.replace("-", "");
                        return value.toLowerCase().indexOf(item.toLowerCase()) <= -1
                    }
                });
            }

            // Apply search filtering
            if (evaluateQuery(query))
             {
                // Append to group if one exists, else just append to wrapper
                if (item_group != null) {
                    item_group.appendChild(row);
                } else {
                    select.wrapper.non_selected.appendChild(row);
                }
            }
        }

        // Hide empty optgroups
        if (settings.hide_empty_groups) {
            var optgroups = document.getElementsByClassName('item-group');
            for (var i = 0; i < optgroups.length; i++) {
                // Hide optgroup if optgroup only contains a group label
                if (optgroups[i].childElementCount < 2) {
                    optgroups[i].style.display = 'none';
                }
            }
        }
    };

    // Intializes and constructs an multi.js instance
    var init = function(select, settings) {
        /**
         * Set up settings (optional parameter) and its default values
         *
         * Default values:
         * enable_search : true
         * search_placeholder : "Search..."
         */
        settings = typeof settings !== "undefined" ? settings : {};

        settings["enable_search"] =
            typeof settings["enable_search"] !== "undefined"
                ? settings["enable_search"]
                : true;
        settings["search_placeholder"] =
            typeof settings["search_placeholder"] !== "undefined"
                ? settings["search_placeholder"]
                : "Search...";
        settings["non_selected_header"] =
            typeof settings["non_selected_header"] !== "undefined"
                ? settings["non_selected_header"]
                : null;
        settings["selected_header"] =
            typeof settings["selected_header"] !== "undefined"
                ? settings["selected_header"]
                : null;
        settings["limit"] =
            typeof settings["limit"] !== "undefined"
                ? parseInt(settings["limit"])
                : -1;
        if (isNaN(settings["limit"])) {
            settings["limit"] = -1;
        }
        settings["hide_empty_groups"] =
            typeof settings["hide_empty_groups"] !== "undefined"
                ? settings["hide_empty_groups"]
                : false;

        // Check if already initalized
        if (select.dataset.multijs != null) {
            return;
        }

        // Make sure element is select and multiple is enabled
        if (select.nodeName !== "SELECT" || !select.multiple) {
            return;
        }

        // Hide select
        select.style.display = "none";
        select.setAttribute("data-multijs", true);

        // Start constructing selector
        var wrapper = document.createElement("div");
        wrapper.className = "multi-wrapper";

        // Add search bar
        if (settings.enable_search) {
            var search = document.createElement("input");
            search.className = "search-input";
            search.type = "text";
            search.setAttribute("placeholder", settings.search_placeholder);
            search.setAttribute("title", settings.search_placeholder);

            search.addEventListener("input", function() {
                refresh_select(select, settings);
            });

            wrapper.appendChild(search);
            wrapper.search = search;
        }

        // Add columns for selected and non-selected
        var non_selected = document.createElement("div");
        non_selected.className = "non-selected-wrapper";

        var selected = document.createElement("div");
        selected.className = "selected-wrapper";

        // Add click handler to toggle the selected status
        wrapper.addEventListener("click", function(event) {
            if (event.target.getAttribute("multi-index")) {
                toggle_option(select, event, settings);
            }
        });

        // Add keyboard handler to toggle the selected status
        wrapper.addEventListener("keypress", function(event) {
            var is_action_key = event.keyCode === 32 || event.keyCode === 13;
            var is_option = event.target.getAttribute("multi-index");

            if (is_option && is_action_key) {
                // Prevent the default action to stop scrolling when space is pressed
                event.preventDefault();
                toggle_option(select, event, settings);
            }
        });

        wrapper.appendChild(non_selected);
        wrapper.appendChild(selected);

        wrapper.non_selected = non_selected;
        wrapper.selected = selected;

        select.wrapper = wrapper;

        // Add multi.js wrapper after select element
        select.parentNode.insertBefore(wrapper, select.nextSibling);

        // Save current state
        for (var i = 0; i < select.options.length; i++) {
            var option = select.options[i];
            option.setAttribute("data-origin-disabled", option.disabled);
        }

        // Check limit on initialization
        check_limit(select, settings);

        // Initialize selector with values from select element
        refresh_select(select, settings);

        // Refresh selector when select values change
        select.addEventListener("change", function() {
            refresh_select(select, settings);
        });
    };

    return init;
})();