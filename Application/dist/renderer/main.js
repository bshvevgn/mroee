"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        this.portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', '/dev/cu.usbserial-210', '/dev/cu.usbserial-10', '/dev/cu.wchusbserial210', '/dev/cu.wchusbserial10', 'COM1', 'COM2', 'COM3', 'COM4'];
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
            // return new Promise<void>((resolve, reject) => {
            //     this.globalPort.on('error', (err: { message: any; }) => {
            //         this.isConnected = false;
            //         reject(err);
            //     });
            // });
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                console.log("attempt");
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
let connector = new Connector();
let isConnected = connector.connected();
let connectionWindowOpened = false;
let globalPort = connector.getGlobalPort();
function connectionCheck() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        globalPort = connector.getGlobalPort();
        if (yield connector.connect()) {
            closeModalWindow('connection');
            (_a = document.getElementById("disconnectedMessage")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            document.getElementById("connectionIcon").style.backgroundImage = "url(resources/icons/connected.png)";
            (_b = document.getElementById("preview")) === null || _b === void 0 ? void 0 : _b.classList.remove("blurredPreview");
            document.getElementById("popupMessage").innerText = "Подключено";
            document.querySelectorAll(".hidableInfo").forEach(element => {
                element.style.display = "block";
            });
            connectionWindowOpened = false;
        }
        else {
            if (!connectionWindowOpened) {
                showModalWindow('connection');
                (_c = document.getElementById("disconnectedMessage")) === null || _c === void 0 ? void 0 : _c.classList.remove("hidden");
                document.getElementById("connectionIcon").style.backgroundImage = "url(resources/icons/disconnected.png)";
                (_d = document.getElementById("preview")) === null || _d === void 0 ? void 0 : _d.classList.add("blurredPreview");
                document.getElementById("popupMessage").innerText = "Отключено";
                document.querySelectorAll(".hidableInfo").forEach(element => {
                    element.style.display = "none";
                });
                connectionWindowOpened = true;
            }
        }
    });
}
setInterval(() => connectionCheck(), 1500);
const fs = __importStar(require("fs"));
class JsonEditor {
    constructor(filePath) {
        this.filePath = filePath;
        this.jsonData = this.loadJsonData();
    }
    loadJsonData() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            return [];
        }
    }
    saveJsonData() {
        const jsonDataString = JSON.stringify(this.jsonData, null, 2);
        fs.writeFileSync(this.filePath, jsonDataString, 'utf8');
    }
    findObjectById(id) {
        return this.jsonData.find(obj => obj.id === id);
    }
    editAttributeById(id, attributeName, newValue) {
        const obj = this.findObjectById(id);
        if (obj) {
            obj[attributeName] = newValue;
            this.saveJsonData();
        }
        else {
            console.info(`Object with id ${id} not found.`);
        }
    }
    createButtonObject(id, icon, shortcut) {
        const existingObj = this.findObjectById(id);
        if (existingObj) {
            console.info(`Object with id ${id} already exists.`);
        }
        else {
            const newObj = { id, icon, shortcut };
            this.jsonData.push(newObj);
            this.saveJsonData();
        }
    }
    createModeObject(id, mode) {
        const existingObj = this.findObjectById(id);
        if (existingObj) {
            console.info(`Object with id ${id} already exists.`);
        }
        else {
            const newObj = { id, mode };
            this.jsonData.push(newObj);
            this.saveJsonData();
        }
    }
    createShortcutsList() {
        const existingObj = this.findObjectById("shortcutsList");
        if (existingObj) {
            console.info(`Object already exists.`);
        }
        else {
            let id = "shortcutsList";
            let list = [];
            const newObj = { id, list };
            this.jsonData.push(newObj);
            this.saveJsonData();
        }
    }
    addShortcut(shortcut) {
        const obj = this.findObjectById("shortcutsList");
        if (obj && obj.list) {
            obj.list.push(shortcut);
            this.saveJsonData();
        }
        else {
            console.info(`Object with "shortcuts" property not found.`);
        }
    }
    removeShortcut(shortcut) {
        const obj = this.findObjectById("shortcutsList");
        if (obj && obj.list) {
            var index = obj.list.indexOf(shortcut);
            let newList = obj.list;
            newList.splice(index, 1);
            if (index !== -1) {
                obj.list = newList;
            }
            this.saveJsonData();
        }
        else {
            console.info(`Object with "shortcuts" property not found.`);
        }
    }
    getShortcuts() {
        const obj = this.findObjectById("shortcutsList");
        console.log(obj === null || obj === void 0 ? void 0 : obj.id);
        if (obj && obj.list) {
            return obj.list;
        }
        else {
            console.error(`Object with "shortcuts" property not found.`);
            return undefined;
        }
    }
}
const brightnessToggle = document.getElementById('brightnessToggle');
const images = ["resources/icons/maxBr.png", "resources/icons/autoBr.png", "resources/icons/moon.png"];
let currentBrMode = 1;
function toggleImage() {
    const currentImage = images[currentBrMode];
    console.log(currentBrMode);
    globalPort.write("dim" + (currentBrMode + 1));
    console.log("dim" + (currentBrMode + 1));
    brightnessToggle.style.backgroundImage = `url('${currentImage}')`;
    currentBrMode = (currentBrMode + 1) % images.length;
}
brightnessToggle.addEventListener('click', () => {
    toggleImage();
});
const jsonFilePath = 'resources/config/config.json';
const editor = new JsonEditor(jsonFilePath);
function importShortcuts() {
    let shortcuts = editor.getShortcuts();
    shortcuts.forEach(shortcut => {
        addCombination(shortcut);
    });
    update();
}
function loadDimMode() {
    // let mode = editor.getShortcuts();
    // shortcuts!.forEach(shortcut => {
    //   addCombination(shortcut);
    // });
    // update();
}
//editor.editAttributeById('someId', 'icon', 'newIcon');
addEventListener("load", (event) => {
    editor.createButtonObject('button1', 'copy', 'meta;c');
    editor.createButtonObject('button2', 'paste', 'meta;v');
    editor.createButtonObject('button3', 'moon', 'meta;control;d');
    editor.createButtonObject('button4', 'lock', 'meta;shift;q');
    editor.createModeObject('dimMode', '2');
    editor.createShortcutsList();
    importShortcuts();
    loadDimMode();
    for (let i = 1; i < 5; i++) {
        const iconBox = document.getElementById("iconBox" + i).querySelectorAll(".previewIcon")[0];
        const iconPath = `url(resources/icons/${editor.findObjectById("button" + i)["icon"]}.png)`;
        iconBox.style.backgroundImage = iconPath;
        //alert(iconBox.style.backgroundImage);
    }
    //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].style.backgroundImage);
    //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].classList);
});
const iconsByCategory = {
    'Действия с файлами': ['copy', 'paste', 'info', 'trash', 'rename', 'share', 'save'],
    'Мультимедиа': ['play', 'pause', 'backward', 'forward', 'full-screen', 'collapse', 'p-in-p'],
    'Системные действия': ['lock', 'moon', 'screenshot', 'mic', 'mic1', 'eject', 'search', 'update', 'mute', 'volumedown', 'volumeup', 'heart', 'apps', 'console', 'mail', 'clock', 'calendar', 'close'],
    'Редактирование': ['cut', 'edit', 'dropper', 'repeat', 'undo']
};
function getIconIndex(iconName) {
    const allIcons = Object.keys(iconsByCategory).flatMap(category => iconsByCategory[category]);
    const index = allIcons.indexOf(iconName);
    console.log("1 " + index);
    return index !== -1 ? index : undefined;
}
let popups = [];
class SettingsPopup {
    getMenuHTML(category) {
        const iconNames = iconsByCategory[category];
        return `
        <p class="subtitle">${category}</p>
        ${iconNames.map((name, index) => `
          <div class="listElement iconElement button" onClick="handleIconClick(${this.numberOfScreen}, '${name}');">
            <div class="icon" style="background-image: url(resources/icons/${name}.png);"></div>
          </div>
        `).join('')}
    `;
    }
    constructor(element) {
        this.menuOpened = false;
        this.numberOfScreen = "";
        this.menu = document.createElement("div");
        this.element = element;
        this.numberOfScreen = this.element.id.substring(7, 8);
        popups.push(this);
        this.element.addEventListener('click', () => this.operateMenu());
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
            popups.forEach(popup => {
                if (popup != this) {
                    popup.closeMenu();
                }
            });
            console.log(this.menuOpened);
            this.openMenu();
            console.log(this.menuOpened);
        }
    }
    closeMenu() {
        const menu = this.menu;
        this.element.classList.remove('activePreview');
        menu.classList.add('hidden');
        setTimeout(() => menu.remove(), 200);
        this.menuOpened = false;
    }
    openMenu() {
        var _a, _b;
        this.menuOpened = true;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.classList.add('activePreview');
        this.menu.classList.add("iconMenu");
        this.menu.classList.add("hidden");
        this.menu.id = "menu" + this.element.id.substring(7, 8);
        const categories = Object.keys(iconsByCategory);
        let menuHTML = `<h2 style="margin-left: 14px; margin-bottom: 8px;">Выбор значка</h2><div class="column iconsColumn">`;
        categories.forEach(category => {
            menuHTML += this.getMenuHTML(category);
        });
        menuHTML += `</div>`;
        this.menu.innerHTML = menuHTML;
        const iconButtons = document.querySelectorAll(".iconElement");
        iconButtons.forEach(button => {
            button.addEventListener('click', () => this.operateMenu());
        });
        this.menu.style.position = "absolute";
        this.menu.style.zIndex = "1000";
        this.menu.style.left = this.element.getBoundingClientRect().left + "px";
        this.menu.style.top = this.element.getBoundingClientRect().top + "px";
        (_b = document.querySelector("body")) === null || _b === void 0 ? void 0 : _b.appendChild(this.menu);
        setTimeout(() => this.menu.classList.remove('hidden'), 10);
    }
}
function textToShortcut(text) {
    return text.replace(/(\s)\+(\s)/g, ';').toLowerCase();
}
function setShortcutToScreen(numberOfScreen, shortcutText) {
    const shortcut = textToShortcut(shortcutText);
    globalPort.write("s" + numberOfScreen + "sc" + shortcut + "\n");
    console.log("s" + numberOfScreen + "sc" + shortcut);
    editor.editAttributeById(("button" + numberOfScreen), "shortcut", shortcut);
}
function handleIconClick(numberOfScreen, name) {
    const innerIcon = document.querySelectorAll(".previewIcon")[numberOfScreen - 1];
    const iconName = name;
    console.log(name);
    if (name === "pause" || name === "play" || name === "volumeup" || name === "volumedown" || name === "mute") {
        setShortcutToScreen(numberOfScreen, name);
    }
    editor.editAttributeById(("button" + numberOfScreen), "icon", name);
    let index = getIconIndex(name);
    globalPort.write("s" + numberOfScreen + "i" + index);
    console.log("s" + numberOfScreen + "i" + index);
    innerIcon.style.backgroundImage = `url(resources/icons/${iconName}.png)`;
    innerIcon.style.animation = "bounce .2s ease-in-out running";
    setTimeout(() => innerIcon.style.animation = "none", 200);
}
const previewIconBoxes = document.querySelectorAll('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
    new SettingsPopup(previewIconBox);
});
const asideButtons = document.querySelectorAll('.asideButton');
const contentBoxes = document.querySelectorAll('.content');
let prevID = "";
function selectContent(button) {
    var _a, _b;
    prevID = document.querySelector(".selectedContent").id;
    console.log(prevID);
    setTimeout(() => update(), 300);
    let buttonID = button.id;
    let id = buttonID.substring(0, buttonID.length - 6);
    if (id !== "iconsSet") {
        (_a = document.getElementById("connectionWidget")) === null || _a === void 0 ? void 0 : _a.classList.remove("hiddenAsideWidget");
    }
    else {
        (_b = document.getElementById("connectionWidget")) === null || _b === void 0 ? void 0 : _b.classList.add("hiddenAsideWidget");
    }
    asideButtons.forEach(button => {
        button.classList.remove('activeButton');
    });
    button.classList.add('activeButton');
    contentBoxes.forEach(box => {
        box.classList.remove("selectedContent");
    });
    contentBoxes.forEach(box => {
        if (box.id == prevID) {
            box.classList.add('hiddenContent');
        }
        if (box.id == id) {
            box.classList.remove('nextContent');
            box.classList.remove('hiddenContent');
            box.classList.add('selectedContent');
        }
    });
    contentBoxes.forEach(box => {
        if (box.id != id) {
            setTimeout(() => {
                box.classList.remove('hiddenContent');
                box.classList.add('nextContent');
            }, 300);
        }
    });
}
function closeModalWindow(ID) {
    document.getElementById(ID + "Window").classList.add('closedModalWindow');
    document.getElementById("modalWindowBack").classList.add("hiddenModalBack");
}
function showModalWindow(ID) {
    console.log(ID);
    document.getElementById(ID + "Window").classList.remove('closedModalWindow');
    document.getElementById("modalWindowBack").classList.remove("hiddenModalBack");
}
const keysInputBox = document.getElementById("keysInputBox");
const saveButton = document.getElementById("saveButton");
const saveButtonBack = document.querySelectorAll(".saveButtonBack");
const combinationsBox = document.getElementById("combinationsBox");
const clearButton = document.getElementById("clearInputButton");
const combinations = [];
let buttonsCount = 0;
function trackKeyPress(event) {
    if (/^[a-zA-Z\s]+$/.test(event.key)) {
        buttonsCount++;
        if (buttonsCount > 0) {
            clearButton.style.opacity = "1";
        }
        else {
            clearButton.style.opacity = "0";
        }
        if (buttonsCount < 6) {
            event.preventDefault();
            let keyName = event.key;
            if (keyName == " ") {
                keyName = "space";
            }
            const keyDiv = document.createElement("div");
            keyDiv.textContent = keyName.toUpperCase();
            keyDiv.classList.add("keyBox");
            if (buttonsCount == 1)
                keyDiv.classList.add("firstKey");
            keyDiv.classList.add("hiddenKey");
            keysInputBox.appendChild(keyDiv);
            setTimeout(() => keyDiv.classList.remove("hiddenKey"), 10);
        }
    }
    else {
        console.log(event.key);
    }
}
function clearCombination() {
    const divs = keysInputBox.querySelectorAll("div");
    const innerTextArray = [];
    buttonsCount = 0;
    divs.forEach((div) => {
        if (div != clearButton && div != saveButton && div != saveButtonBack[0]) {
            div.remove();
        }
    });
    clearButton.style.opacity = "0";
}
const emptyCombinationsHint = document.getElementById('emptyCombinationsHint');
function addCombination(text) {
    const combinationBlock = document.createElement("div");
    const combinationTextWrapper = document.createElement("div");
    combinationBlock.classList.add("combination");
    combinationBlock.classList.add("button");
    combinationTextWrapper.classList.add("combinationTextWrapper");
    combinationTextWrapper.innerHTML = "<p>" + text + "</p>";
    const combinationRemoveButton = document.createElement("div");
    combinationRemoveButton.classList.add("combinationRemoveButton");
    combinationBlock.appendChild(combinationTextWrapper);
    combinationBlock.appendChild(combinationRemoveButton);
    combinationBlock.addEventListener("click", () => removeCombination(combinationBlock));
    combinationBlock.appendChild(combinationTextWrapper);
    combinationsBox.appendChild(combinationBlock);
    setTimeout(() => combinationBlock.classList.remove("hiddenCombination"), 10);
    buttonsCount = 0;
    if (navigator.platform.includes("Mac")) {
        combinationTextWrapper.innerHTML = combinationTextWrapper.innerHTML
            .replace(/META/g, '</p><div class="combinationIcon" style="background-image: url(resources/icons/command.png)"></div><p>')
            .replace(/ALT/g, '</p><div class="combinationIcon" style="background-image: url(resources/icons/option.png)"></div><p>');
        // .replace(/CONTROL/g, '<div class="combinationIcon" style="background-image: url(resources/icons/control.png)"></div>');
    }
    document.querySelectorAll(".combinationTextWrapper p").forEach(p => {
        if (p.innerHTML === "") {
            p.remove();
        }
    });
    const hiddenText = document.createElement("p");
    hiddenText.classList.add("hiddenCombText");
    hiddenText.innerText = text;
    combinationBlock.appendChild(hiddenText);
    combinationsBox.appendChild(combinationBlock);
    combinationBlock.addEventListener("click", () => removeCombination(combinationBlock));
}
function saveCombination() {
    const divs = keysInputBox.querySelectorAll("div");
    const innerTextArray = [];
    divs.forEach((div) => {
        if (div !== clearButton && div !== saveButton && div !== saveButtonBack[0]) {
            const innerText = div.innerText.trim();
            // Исправленное регулярное выражение
            if (/^[a-zA-Z0-9<>\[\].;'",]+$/.test(innerText)) {
                innerTextArray.push(innerText);
            }
        }
    });
    let combinationText = innerTextArray.join(" ");
    if (combinationText == null) {
        combinationText = "";
    }
    if (divs.length == 3) {
        keysInputBox.classList.add("shake");
        setTimeout(() => keysInputBox.classList.remove("shake"), 400);
        return;
    }
    combinations.push(combinationText);
    editor.addShortcut(combinationText);
    emptyCombinationsHint.style.display = "none";
    skeletons.forEach(element => {
        element.style.display = "none";
    });
    divs.forEach((div) => {
        if (div != clearButton && div != saveButton && div != saveButtonBack[0]) {
            div.remove();
        }
    });
    clearButton.style.opacity = "0";
    const combinationBlock = document.createElement("div");
    const combinationTextWrapper = document.createElement("div"); // Дополнительный div
    combinationBlock.classList.add("combination");
    combinationBlock.classList.add("hiddenCombination");
    combinationBlock.classList.add("button");
    combinationTextWrapper.classList.add("combinationTextWrapper");
    combinationTextWrapper.innerHTML = "<p>" + combinationText + "</p>";
    const combinationRemoveButton = document.createElement("div");
    combinationRemoveButton.classList.add("combinationRemoveButton");
    combinationBlock.appendChild(combinationTextWrapper);
    combinationBlock.appendChild(combinationRemoveButton);
    combinationBlock.addEventListener("click", () => removeCombination(combinationBlock));
    combinationBlock.appendChild(combinationTextWrapper);
    combinationsBox.appendChild(combinationBlock);
    setTimeout(() => combinationBlock.classList.remove("hiddenCombination"), 10);
    buttonsCount = 0;
    if (navigator.platform.includes("Mac")) {
        combinationTextWrapper.innerHTML = combinationTextWrapper.innerHTML
            .replace(/META/g, '</p><div class="combinationIcon" style="background-image: url(resources/icons/command.png)"></div><p>')
            .replace(/ALT/g, '</p><div class="combinationIcon" style="background-image: url(resources/icons/option.png)"></div><p>');
        // .replace(/CONTROL/g, '<div class="combinationIcon" style="background-image: url(resources/icons/control.png)"></div>');
    }
    document.querySelectorAll(".combinationTextWrapper p").forEach(p => {
        if (p.innerHTML === "") {
            p.remove();
        }
    });
}
let listenKeys = false;
//keysInputBox.addEventListener("click", keysListener);
saveButton.addEventListener("click", saveCombination);
clearButton.addEventListener("click", clearCombination);
setActive(keysInputBox, document);
function setActive(targetElement, containerElement = document) {
    containerElement.addEventListener('click', (event) => {
        const clickedElement = event.target;
        if (clickedElement === targetElement /*|| targetElement.contains(clickedElement)*/) {
            targetElement.classList.add('active');
            if (!listenKeys)
                keysListener();
        }
        else {
            if (targetElement != null) {
                targetElement.classList.remove('active');
                if (listenKeys)
                    keysListener();
            }
        }
    });
}
function keysListener() {
    if (listenKeys) {
        document.removeEventListener("keydown", trackKeyPress);
        listenKeys = !listenKeys;
    }
    else {
        document.addEventListener("keydown", trackKeyPress);
        listenKeys = !listenKeys;
    }
}
function removeCombination(box) {
    box.classList.add("hiddenCombination");
    editor.removeShortcut(box.querySelectorAll("p")[0].innerText);
    setTimeout(() => { box.remove(); update(); }, 200);
}
const terminalInputBox = document.getElementById("terminalInputBox");
const saveTerminalButton = document.getElementById("saveTerminalButton");
const commandsBox = document.getElementById("treminalCommandsBox");
const clearCommandButton = document.getElementById("clearTerminalInputButton");
const commands = [];
let commandLength = 0;
function trackInput(event) {
    commandLength++;
    if (buttonsCount > 0) {
        clearButton.style.opacity = "1";
    }
    else {
        clearButton.style.opacity = "0";
    }
    if (commandLength < 500) {
        event.preventDefault();
        let keyName = event.key;
        if (keyName == " ") {
            keyName = "space";
        }
        const keyDiv = document.createElement("div");
        keyDiv.textContent = keyName.toUpperCase();
        keyDiv.classList.add("keyBox");
        if (buttonsCount == 1)
            keyDiv.classList.add("firstKey");
        keyDiv.classList.add("hiddenKey");
        keysInputBox.appendChild(keyDiv);
        setTimeout(() => keyDiv.classList.remove("hiddenKey"), 10);
    }
}
function clearCommand() {
    commandLength = 0;
    commandsBox.innerText = "";
    clearButton.style.opacity = "0";
}
const emptyCommandsHint = document.getElementById('emptyCommandsHint');
const skeletons = document.querySelectorAll(".combinationSkeleton");
function saveCommand() {
    const commandsArray = [];
    commandsArray.push(commandsBox.innerText);
    if (commandsBox.innerText = "") {
        keysInputBox.classList.add("shake");
        setTimeout(() => keysInputBox.classList.remove("shake"), 400);
        return;
    }
    emptyCommandsHint.style.display = "none";
    skeletons.forEach(element => {
        element.style.display = "none";
    });
    //combinationsBox!.style.backgroundImage = "url()";
    clearCommand();
    clearButton.style.opacity = "0";
    /*const combinationDiv = document.createElement("div");
    const combinationTextBlock = document.createElement("p");
    combinationDiv.classList.add("combination");
    combinationDiv.classList.add("hiddenCombination");
    combinationTextBlock.innerHTML = combinationText;
    
    const combinationRemoveButton = document.createElement("div");
    combinationRemoveButton.classList.add("combinationRemoveButton");
  
    combinationDiv.appendChild(combinationRemoveButton);
    combinationDiv.appendChild(combinationTextBlock);
    combinationsBox.appendChild(combinationDiv);
    combinationDiv.addEventListener("click", () => removeCombination(combinationDiv));
    setTimeout(() => combinationDiv.classList.remove("hiddenCombination"), 10);
    buttonsCount = 0;*/
}
//keysInputBox.addEventListener("click", keysListener);
saveButton.addEventListener("click", saveCombination);
clearButton.addEventListener("click", clearCombination);
setActive(commandsBox);
/*function removeCombination(box: HTMLElement) {
  box.classList.add("hiddenCombination");
  setTimeout(() => {box.remove(); update()}, 200);
}*/
function update() {
    const combinationBoxes = document.querySelectorAll(".combination");
    if (combinationBoxes.length > 0) {
        emptyCombinationsHint.style.display = "none";
        skeletons.forEach(element => {
            element.style.display = "none";
        });
    }
    else {
        emptyCombinationsHint.style.display = "block";
        skeletons.forEach(element => {
            element.style.display = "block";
        });
    }
    const combinationsPanel = document.getElementById("combinationsBox");
    const combinationConfigPanel = document.getElementById("combinationsSectionInner");
    copyCombinations(combinationsPanel, combinationConfigPanel);
    let draggables = document.querySelectorAll("#combinationsSectionInner .draggable");
    draggables.forEach(draggable => {
        new DraggableElement(draggable);
    });
}
function copyCombinations(source, target) {
    target.innerHTML = '';
    for (const child of source.children) {
        let clone = child.cloneNode(true);
        clone.classList.add("draggable");
        target.appendChild(clone);
    }
    const removeButtons = target.querySelectorAll(".combinationRemoveButton");
    removeButtons.forEach(button => {
        button.remove();
    });
}
class DraggableElement {
    constructor(element) {
        this.underDroppable = false;
        this.underElement = null;
        this.currentDroppable = null;
        this.originX = 0;
        this.originY = 0;
        this.shiftX = 0;
        this.shiftY = 0;
        this.element = element;
        this.element.addEventListener('mousedown', (this.onMouseDown.bind(this)));
        this.element.ondragstart = function () {
            return false;
        };
    }
    onMouseDown(event) {
        this.originX = this.element.getBoundingClientRect().left;
        this.originY = this.element.getBoundingClientRect().top;
        const shiftX = event.clientX - this.element.getBoundingClientRect().left;
        const shiftY = event.clientY - this.element.getBoundingClientRect().top;
        this.shiftX = shiftX;
        this.shiftY = shiftY;
        this.clone = this.element.cloneNode(true);
        document.body.appendChild(this.clone);
        this.clone.style.position = 'absolute';
        this.clone.style.zIndex = '1000';
        this.clone.style.transform = 'scale(1)';
        this.clone.style.transition = ".2s";
        setTimeout(() => this.clone.style.transform = 'scale(1.1)', 10);
        setTimeout(() => this.clone.style.transition = "0s", 300);
        this.clone.id += 'Clone';
        this.element.style.transition = '0s';
        this.element.style.opacity = '0';
        this.moveAt(event.pageX, event.pageY);
        const onMouseMove = (event) => {
            const previews = document.querySelectorAll(".previewIconBox");
            previews.forEach(preview => {
                preview.classList.add("dashedPreview");
            });
            this.moveAt(event.pageX, event.pageY);
            this.clone.style.display = "none";
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            this.clone.style.display = "block";
            // console.log(elemBelow?.innerHTML);
            if (!elemBelow)
                return;
            const droppableBelow = elemBelow.closest('.droppable');
            if (this.currentDroppable !== droppableBelow) {
                if (this.currentDroppable) {
                    this.leaveDroppable(this.currentDroppable);
                }
                this.currentDroppable = droppableBelow;
                if (this.currentDroppable) {
                    this.enterDroppable(this.currentDroppable);
                }
            }
        };
        document.addEventListener('mousemove', onMouseMove);
        this.clone.onmouseup = () => {
            const previews = document.querySelectorAll(".previewIconBox");
            previews.forEach(preview => {
                preview.classList.remove("dashedPreview");
            });
            document.removeEventListener('mousemove', onMouseMove);
            this.clone.onmouseup = null;
            this.clone.style.transition = '.3s';
            this.element.style.transition = '.3s';
            if (!this.underDroppable) {
                this.clone.style.transform = 'scale(1)';
                this.clone.style.left = this.originX + 'px';
                this.clone.style.top = this.originY + 'px';
            }
            else {
                const numberOfScreen = this.underElement.id.substring(7, 8);
                const shortcut = this.textToShortcut(this.clone.querySelectorAll(".hiddenCombText")[0].innerText);
                globalPort.write("s" + numberOfScreen + "sc" + shortcut);
                console.log("s" + numberOfScreen + "sc" + shortcut);
                editor.editAttributeById(("button" + numberOfScreen), "shortcut", shortcut);
                this.clone.style.left =
                    this.underElement.getBoundingClientRect().left + (this.underElement.offsetWidth - this.clone.offsetWidth) / 2 + 'px';
                this.clone.style.top =
                    this.underElement.getBoundingClientRect().top + (this.underElement.offsetHeight - this.clone.offsetHeight) / 2 + 'px';
                //this.underElement!.style.backdropFilter = "blur(10px)";
                let doneMark = document.createElement("div");
                doneMark.classList.add("doneMark");
                setTimeout(() => {
                    this.clone.style.filter = 'blur(20px)';
                    this.underElement.querySelectorAll(".previewIcon")[0].style.transition = ".2s";
                    this.underElement.querySelectorAll(".previewIcon")[0].style.opacity = "0";
                    this.underElement.appendChild(doneMark);
                    this.clone.style.transform = 'scale(.6)';
                    this.underElement.classList.remove('droppableActive');
                }, 200);
                setTimeout(() => { doneMark.style.opacity = "0"; }, 1300);
                setTimeout(() => { this.underElement.removeChild(doneMark); this.underElement.style.backdropFilter = "blur(0px)"; this.underElement.querySelectorAll(".previewIcon")[0].style.opacity = "1"; }, 1500);
                setTimeout(() => this.underElement.querySelectorAll(".previewIcon")[0].style.transition = ".1s", 1700);
            }
            setTimeout(() => (this.clone.style.opacity = '0'), 300);
            setTimeout(() => (this.element.style.opacity = '1'), 200);
            setTimeout(() => { this.clone.remove(); }, 600);
        };
    }
    moveAt(pageX, pageY) {
        this.clone.style.left = pageX - this.shiftX + 'px';
        this.clone.style.top = pageY - this.shiftY + 'px';
    }
    enterDroppable(elem) {
        elem.classList.add('droppableActive');
        this.underDroppable = true;
        this.underElement = elem;
    }
    leaveDroppable(elem) {
        elem.classList.remove('droppableActive');
        this.underDroppable = false;
    }
    textToShortcut(text) {
        return text.replace(/(\s)/g, ';').toLowerCase();
    }
}
setTimeout(() => { var _a; return (_a = document.getElementById('preloader')) === null || _a === void 0 ? void 0 : _a.classList.add('hiddenPreloader'); }, 2000);
setTimeout(() => document.getElementById('logoAnimation').style.display = "none", 2300);
