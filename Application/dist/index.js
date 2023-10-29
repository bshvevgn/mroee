"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let mainWindow;
electron_1.app.on("ready", createWindows);
function createWindows() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200, height: 800,
        webPreferences: {
            preload: __dirname + "/preload.js",
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 10, y: 10 }
    });
    mainWindow.loadFile("./index.html");
    mainWindow.on("ready-to-show", () => mainWindow.show());
}
