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
setTimeout(() => { var _a; return (_a = document.getElementById('preloader')) === null || _a === void 0 ? void 0 : _a.classList.add('hiddenPreloader'); }, 1600);
const { SerialPort } = require('serialport');
let isConnected = true;
let receivedData = false;
let globalPortName = '';
let globalPort = new SerialPort({
    path: 'COM1',
    baudRate: 115200
});
let accumulatedData = '';
function parseData(data, portName) {
    console.log("parsing");
    const regex = /^SwiftController;S\/N(\d+)/;
    const match = data.match(regex);
    if (match) {
        receivedData = true;
        const [, serialNumber] = match;
        console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
        document.getElementById('serialNumber').innerHTML = "S/N: " + serialNumber;
    }
}
let port = new SerialPort({
    path: 'COM1',
    baudRate: 115200
});
function connectTo(portName) {
    return __awaiter(this, void 0, void 0, function* () {
        port = new SerialPort({
            path: portName,
            baudRate: 115200
        });
        port.write('sendConnect');
        port.on('open', () => {
            globalPort = port;
            globalPortName = portName;
            isConnected = true; //-----
        });
        return new Promise((resolve, reject) => {
            port.on('error', (err) => {
                isConnected = false; //-----
                console.log(`Ошибка на порту ${portName}: ${err.message}`);
                reject(err);
            });
        });
    });
}
function readData() {
    return __awaiter(this, void 0, void 0, function* () {
        globalPort.on('data', (data) => {
            const dataStr = data.toString();
            accumulatedData += dataStr;
            parseData(accumulatedData, globalPortName);
        });
        globalPort.on('close', function () {
            isConnected = false;
        });
        return new Promise((resolve, reject) => {
            globalPort.on('error', (err) => {
                isConnected = false; //-----
                console.log(`Ошибка на порту ${globalPortName}: ${err.message}`);
                reject(err);
            });
        });
    });
}
const portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', 'COM1', 'COM2', 'COM3', 'COM4'];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Port opened: " + globalPort.isOpen + " Connected: " + isConnected);
        if (isConnected) {
            closeModalWindow('connection');
        }
        else {
            showModalWindow('connection');
        }
        if (!isConnected) {
            for (const portName of portNames) {
                try {
                    yield connectTo(portName);
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        else {
            if (!receivedData) {
                try {
                    yield readData();
                }
                catch (err) {
                    console.log(err);
                }
            }
            else {
                yield readData();
                port.removeAllListeners('error');
                port.removeAllListeners('open');
            }
        }
    });
}
setInterval(() => main(), 500);
globalPort.on('close', function () {
    isConnected = false;
});
globalPort.on('error', function () {
    isConnected = false;
});
class IconsPopup {
    constructor(element) {
        this.menuOpened = false;
        this.numberOfScreen = "";
        this.element = element;
        let menuOpened = this.menuOpened;
        this.numberOfScreen = this.element.id.substring(7, 8);
        this.element.addEventListener('click', this.operateMenu.bind(this));
    }
    checkMenu() {
        if (this.menuOpened) {
            this.closeMenu();
        }
    }
    operateMenu() {
        if (this.menuOpened) {
            this.closeMenu();
        }
        else {
            this.addMenu();
        }
    }
    closeMenu() {
        const menu = this.element.querySelectorAll(".iconMenu")[0];
        menu.classList.add('hidden');
        setTimeout(() => menu.remove(), 200);
        this.menuOpened = false;
    }
    addMenu() {
        this.menuOpened = true;
        const menu = document.createElement('div');
        const menuDrop = document.createElement('div');
        menuDrop.classList.add('icon');
        menuDrop.classList.add('menuDrop');
        menu.appendChild(menuDrop);
        menu.classList.add('iconMenu');
        menu.classList.add('hidden');
        this.element.appendChild(menu);
        setTimeout(() => menu.classList.remove('hidden'), 10);
        const innerIcon = this.element.querySelectorAll(".previewIcon")[0];
        const iconNames = ['copy', 'paste', 'mute', 'volumeup', 'volumedown', 'pause', 'play', 'backward', 'forward', 'screenshot', 'search', 'moon', 'lock'];
        const names = ['Копировать', 'Вставить', 'Без звука', 'Громкость +', 'Громкость -', 'Пауза', 'Продолжить', 'Назад', 'Вперёд', 'Снимок экрана', 'Поиск', 'Не беспокоить', 'Заблокировать'];
        iconNames.forEach((name, index) => {
            const icon = document.createElement('div');
            const iconName = document.createElement('p');
            const label = names[index];
            iconName.textContent = label;
            const iconIco = document.createElement('div');
            iconIco.style.backgroundImage = `url(resources/icons/${name}.png)`;
            iconIco.classList.add('icon');
            icon.appendChild(iconIco);
            icon.appendChild(iconName);
            icon.classList.add('listElement');
            menu.appendChild(icon);
            icon.addEventListener('click', () => {
                console.log("s" + this.numberOfScreen + "i" + index);
                innerIcon.style.backgroundImage = `url(resources/icons/${name}.png)`;
                globalPort.write("s" + this.numberOfScreen + "i" + index);
            });
        });
    }
}
const previewIconBoxes = document.querySelectorAll('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
    new IconsPopup(previewIconBox);
});
const asideButtons = document.querySelectorAll('.asideButton');
const contentBoxes = document.querySelectorAll('.content');
function selectContent(button) {
    let buttonID = button.id;
    let id = buttonID.substring(0, buttonID.length - 6);
    asideButtons.forEach(button => {
        button.classList.remove('activeButton');
    });
    button.classList.add('activeButton');
    contentBoxes.forEach(box => {
        box.classList.add('hiddenContent');
        if (box.id == id) {
            box.classList.remove('hiddenContent');
        }
    });
}
function closeModalWindow(ID) {
    document.getElementById(ID + "Window").classList.add('closedModalWindow');
    document.getElementById("modalWindowBack").classList.add("hiddenModalBack");
}
function showModalWindow(ID) {
    document.getElementById(ID + "Window").classList.remove('closedModalWindow');
    document.getElementById("modalWindowBack").classList.remove("hiddenModalBack");
}
const keysInputBox = document.getElementById("keysInputBox");
const saveButton = document.getElementById("saveButton");
const combinationsBox = document.getElementById("combinationsBox");
const combinations = [];
let buttonsCount = 0;
function trackKeyPress(event) {
    keysInputBox.style.border = "1px solid rgba(255, 255, 255, 0.6)";
    buttonsCount++;
    if (buttonsCount < 5) {
        event.preventDefault();
        const keyName = event.key;
        const keyDiv = document.createElement("div");
        keyDiv.textContent = keyName.toUpperCase();
        keyDiv.classList.add("hiddenKey");
        keysInputBox.appendChild(keyDiv);
        setTimeout(() => keyDiv.classList.remove("hiddenKey"), 10);
    }
}
const clearButton = document.getElementById("clearInputButton");
function clearCombination() {
    const divs = keysInputBox.querySelectorAll("div");
    const innerTextArray = [];
    buttonsCount = 0;
    divs.forEach((div) => {
        if (div != clearButton) {
            div.remove();
        }
    });
}
function saveCombination() {
    const divs = keysInputBox.querySelectorAll("div");
    const innerTextArray = [];
    divs.forEach((div) => {
        innerTextArray.push(div.innerText);
    });
    let combinationText = innerTextArray.join(" + ");
    if (combinationText == null) {
        combinationText = "";
    }
    combinations.push(combinationText);
    keysInputBox.textContent = "";
    const combinationDiv = document.createElement("div");
    combinationDiv.classList.add("combination");
    combinationDiv.classList.add("hiddenCombination");
    combinationDiv.textContent = combinationText;
    combinationsBox.appendChild(combinationDiv);
    setTimeout(() => combinationDiv.classList.remove("hiddenCombination"), 10);
    buttonsCount = 0;
}
document.addEventListener("keydown", trackKeyPress);
saveButton.addEventListener("click", saveCombination);
clearButton.addEventListener("click", clearCombination);
