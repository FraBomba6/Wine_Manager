const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('html/index.html').then(() => {
        win.maximize();
        win.show();
    })
    return win;
}

app.whenReady().then(() => {
    const win = createWindow();
    ipcMain.on("force_reload", () => {
        win.reload();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});