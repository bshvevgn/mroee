import {BrowserView, BrowserWindow, app, ipcMain} from "electron";

let mainWindow : BrowserWindow;

app.setName('mroee /connect');
app.on("ready", createWindows);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });

app.on('activate', function () {
    if (mainWindow === null) createWindows();
  });

function createWindows (): void {
    mainWindow = new BrowserWindow({
        title: "mroee /connect", width: 1400, height: 800, minWidth: 1200, minHeight: 780,
        webPreferences: {
            preload: __dirname + "/preload.js",
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false,
        titleBarStyle: 'hidden',
    });

    mainWindow.loadFile("./index.html");
    mainWindow.on("ready-to-show", () => mainWindow.show())
}
