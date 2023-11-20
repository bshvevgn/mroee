"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalPort = void 0;
const windowOperations = require('./windowOperations');
const { SerialPort } = require('serialport');
let connectionWindowOpened = false;
let isConnected = true;
let receivedData = false;
let globalPortName = '';
exports.globalPort = new SerialPort({
    path: 'COM1',
    baudRate: 115200
});
let port = new SerialPort({
    path: 'COM1',
    baudRate: 115200
});
const portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', 'COM1', 'COM2', 'COM3', 'COM4'];
let accumulatedData = '';
function parseData(data, portName) {
    const regex = /^mroee;S\/N(\d+)/;
    const match = data.match(regex);
    if (match) {
        receivedData = true;
        const [, serialNumber] = match;
        console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
        document.getElementById('serialNumber').innerHTML = "S/N: " + serialNumber;
    }
}
function connectTo(portName) {
    return __awaiter(this, void 0, void 0, function* () {
        port = new SerialPort({
            path: portName,
            baudRate: 115200
        });
        port.write('sendConnect');
        port.on('open', () => {
            exports.globalPort = port;
            globalPortName = portName;
            isConnected = true; //-----
        });
        return new Promise((resolve, reject) => {
            port.on('error', (err) => {
                isConnected = false; //-----
                //console.log(`Ошибка на порту ${portName}: ${err.message}`);
                reject(err);
            });
        });
    });
}
function readData() {
    return __awaiter(this, void 0, void 0, function* () {
        exports.globalPort.on('data', (data) => {
            const dataStr = data.toString();
            accumulatedData += dataStr;
            parseData(accumulatedData, globalPortName);
        });
        exports.globalPort.on('close', function () {
            isConnected = false;
        });
        return new Promise((resolve, reject) => {
            exports.globalPort.on('error', (err) => {
                isConnected = false; //-----
                //console.log(`Ошибка на порту ${globalPortName}: ${err.message}`);
                reject(err);
            });
        });
    });
}
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        //console.log("Port opened: " + globalPort.isOpen + " Connected: " + isConnected);
        if (isConnected) {
            windowOperations.closeModalWindow('connection');
            (_a = document.getElementById("disconnectedMessage")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            document.getElementById("connectionIcon").style.backgroundImage = "url(resources/icons/connected.png)";
            (_b = document.getElementById("preview")) === null || _b === void 0 ? void 0 : _b.classList.remove("blurredPreview");
            connectionWindowOpened = false;
        }
        else {
            /*if(!connectionWindowOpened){
              showModalWindow('connection');
              document.getElementById("disconnectedMessage")?.classList.remove("hidden");
              document.getElementById("connectionIcon")!.style.backgroundImage = "url(resources/icons/disconnected.png)";
              document.getElementById("preview")?.classList.add("blurredPreview");
              connectionWindowOpened = true;
            }*/
        }
        if (!isConnected) {
            for (const portName of portNames) {
                try {
                    yield connectTo(portName);
                }
                catch (err) {
                    //console.log(err);
                }
            }
        }
        else {
            if (!receivedData) {
                try {
                    yield readData();
                }
                catch (err) {
                    //console.log(err);
                }
            }
            else {
                //await readData();
                port.removeAllListeners('error');
                port.removeAllListeners('open');
            }
        }
    });
}
exports.globalPort.on('close', function () {
    isConnected = false;
});
exports.globalPort.on('error', function () {
    isConnected = false;
});
setInterval(() => main(), 1500);
