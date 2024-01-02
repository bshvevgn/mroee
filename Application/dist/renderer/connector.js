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
const { SerialPort } = require('serialport');
class Connector {
    constructor() {
        this.connectionWindowOpened = false;
        this.isConnected = true;
        this.receivedData = false;
        this.globalPortName = '';
        this.globalPort = new SerialPort({
            path: 'COM1',
            baudRate: 115200
        });
        this.port = new SerialPort({
            path: 'COM1',
            baudRate: 115200
        });
        this.portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', '/dev/cu.usbserial-210', '/dev/cu.wchusbserial210', 'COM1', 'COM2', 'COM3', 'COM4'];
        this.accumulatedData = '';
        this.globalPort.on('close', () => {
            this.isConnected = false;
        });
        this.globalPort.on('error', () => {
            this.isConnected = false;
        });
    }
    parseData(data, portName) {
        const regex = /^mroee;S\/N(\d+)/;
        const match = data.match(regex);
        if (match) {
            this.receivedData = true;
            const [, serialNumber] = match;
            console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
            document.getElementById('serialNumber').innerHTML = "S/N: " + serialNumber;
        }
    }
    connectTo(portName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.port = new SerialPort({
                path: portName,
                baudRate: 115200
            });
            this.port.write('sendConnect');
            this.port.on('open', () => {
                this.globalPort = this.port;
                this.globalPortName = portName;
                this.isConnected = true; //-----
            });
            return new Promise((resolve, reject) => {
                this.port.on('error', (err) => {
                    this.isConnected = false; //-----
                    //console.log(`Ошибка на порту ${portName}: ${err.message}`);
                    reject(err);
                });
            });
        });
    }
    readData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.globalPort.on('data', (data) => {
                const dataStr = data.toString();
                this.accumulatedData += dataStr;
                this.parseData(this.accumulatedData, this.globalPortName);
            });
            this.globalPort.on('close', () => {
                this.isConnected = false;
            });
            return new Promise((resolve, reject) => {
                this.globalPort.on('error', (err) => {
                    this.isConnected = false;
                    reject(err);
                });
            });
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                for (const portName of this.portNames) {
                    try {
                        yield this.connectTo(portName);
                    }
                    catch (err) {
                        //console.log(err);
                    }
                }
            }
            else {
                if (!this.receivedData) {
                    try {
                        yield this.readData();
                    }
                    catch (err) {
                        //console.log(err);
                    }
                }
                else {
                    //await readData();
                    this.port.removeAllListeners('error');
                    this.port.removeAllListeners('open');
                }
            }
            if (this.isConnected) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    connected() {
        return this.isConnected;
    }
    getGlobalPort() {
        return this.globalPort;
    }
}
exports.default = Connector;
