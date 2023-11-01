import {BrowserView, BrowserWindow, app, ipcMain} from "electron";

let mainWindow : BrowserWindow;

app.setName('mroee /connect');
app.on("ready", createWindows);

function createWindows (): void {
    mainWindow = new BrowserWindow({
        width: 1200, height: 800,
        webPreferences: {
            preload: __dirname + "/preload.js",
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false,
        title: 'mroee /connect',
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 10, y: 10 }
    });

    mainWindow.loadFile("./index.html");
    mainWindow.on("ready-to-show", () => mainWindow.show())
}
