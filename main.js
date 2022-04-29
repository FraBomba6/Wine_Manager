const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./vini.db"
    }
});

function createWindow() {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html').then(() => {
        win.maximize();
        win.show();
    })
    return win;
}

app.whenReady().then(() => {
    const win = createWindow();
    ipcMain.on("mainWindowLoaded", () => {
        let result = knex("vini").where({
            "cantina": "Tommasi"
        }).select("nome")
        result.then(function(rows){
            win.webContents.send("resultSent", rows);
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});