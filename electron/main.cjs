const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Desabilita aceleração de hardware se necessário
// app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Sorteio Fácil PRO",
        icon: path.join(__dirname, '../public/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs') // Atualizado para .cjs
        },
        autoHideMenuBar: false
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5173');
        // win.webContents.openDevTools();
    } else {
        // Carrega o arquivo da pasta de build (dist)
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
