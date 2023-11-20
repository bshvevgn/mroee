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
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.showModalWindow = exports.closeModalWindow = exports.emptyCombinationsHint = void 0;
const Connection = __importStar(require("./connection"));
const json = __importStar(require("./json"));
const inputTrack = __importStar(require("./inputTrack"));
const draggableEl = __importStar(require("./draggable"));
//editor.editAttributeById('someId', 'icon', 'newIcon');
setTimeout(() => { var _a; return (_a = document.getElementById('preloader')) === null || _a === void 0 ? void 0 : _a.classList.add('hiddenPreloader'); }, 2000);
setTimeout(() => document.getElementById('logoAnimation').style.display = "none", 2300);
addEventListener("load", (event) => {
    json.editor.createObject('button1', 'copy', 'meta;c');
    json.editor.createObject('button2', 'paste', 'meta;v');
    json.editor.createObject('button3', 'moon', 'meta;control;d');
    json.editor.createObject('button4', 'lock', 'meta;shift;q');
    json.editor.createShortcutsList();
    for (let i = 1; i < 5; i++) {
        const iconBox = document.getElementById("iconBox" + i).querySelectorAll(".previewIcon")[0];
        const iconPath = `url(resources/icons/${json.editor.findObjectById("button" + i)["icon"]}.png)`;
        iconBox.style.backgroundImage = iconPath;
        //alert(iconBox.style.backgroundImage);
    }
    //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].style.backgroundImage);
    //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].classList);
});
class SettingsPopup {
    constructor(element) {
        this.menuOpened = false;
        this.numberOfScreen = "";
        this.element = element;
        this.numberOfScreen = this.element.id.substring(7, 8);
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
            this.openMenu();
        }
    }
    closeMenu() {
        const menu = document.querySelector("#menu" + this.element.id.substring(7, 8));
        this.element.classList.remove('activePreview');
        menu.classList.add('hidden');
        setTimeout(() => menu.remove(), 200);
        this.menuOpened = false;
    }
    openMenu() {
        var _a, _b;
        this.menuOpened = true;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.classList.add('activePreview');
        let menu = document.createElement("div");
        menu.classList.add("iconMenu");
        menu.classList.add("hidden");
        menu.id = "menu" + this.element.id.substring(7, 8);
        const menuHTML = `
            <div class="categories">
              <div class="category iconsCategory"><p>Значки</p></div>
              <div class="category functionsCategory"><p>Виджеты</p></div>
            </div>
            <div class="column iconsColumn">
              ${iconNames.map((name, index) => `
                  <div class="listElement iconElement button" onClick="handleIconClick(${this.numberOfScreen}, ${index});">
                      <div class="icon" style="background-image: url(resources/icons/${name}.png);"></div>
                      <p>${names[index]}</p>
                  </div>
              `).join('')}
            </div>
            <div class="column functionsCloumn">
  
            </div>
      `;
        menu.innerHTML += menuHTML;
        const iconButtons = document.querySelectorAll(".iconElement");
        iconButtons.forEach(button => {
            button.addEventListener('click', () => this.operateMenu());
        });
        menu.style.position = "absolute";
        menu.style.zIndex = "1000";
        menu.style.left = this.element.getBoundingClientRect().left + "px";
        menu.style.top = this.element.getBoundingClientRect().top + "px";
        (_b = document.querySelector("body")) === null || _b === void 0 ? void 0 : _b.appendChild(menu);
        setTimeout(() => menu.classList.remove('hidden'), 10);
    }
}
exports.emptyCombinationsHint = document.getElementById('emptyCombinationsHint');
const iconNames = ['copy', 'paste', 'mute', 'volumeup', 'volumedown', 'pause', 'play', 'backward', 'forward', 'screenshot', 'search', 'moon', 'lock'];
const names = ['Копировать', 'Вставить', 'Без звука', 'Громкость +', 'Громкость -', 'Пауза', 'Продолжить', 'Назад', 'Вперёд', 'Снимок экрана', 'Поиск', 'Не беспокоить', 'Заблокировать'];
function handleIconClick(numberOfScreen, index) {
    const innerIcon = document.querySelectorAll(".previewIcon")[numberOfScreen - 1];
    const iconName = iconNames[index];
    console.log("s" + numberOfScreen + "i" + index);
    json.editor.editAttributeById(("button" + numberOfScreen), "icon", iconNames[index]);
    innerIcon.style.backgroundImage = `url(resources/icons/${iconName}.png)`;
    innerIcon.style.animation = "bounce .2s ease-in-out running";
    Connection.globalPort.write("s" + numberOfScreen + "i" + index);
    setTimeout(() => innerIcon.style.animation = "none", 200);
}
const previewIconBoxes = document.querySelectorAll('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
    new SettingsPopup(previewIconBox);
});
const asideButtons = document.querySelectorAll('.asideButton');
const contentBoxes = document.querySelectorAll('.content');
function selectContent(button) {
    var _a, _b;
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
exports.closeModalWindow = closeModalWindow;
function showModalWindow(ID) {
    console.log(ID);
    document.getElementById(ID + "Window").classList.remove('closedModalWindow');
    document.getElementById("modalWindowBack").classList.remove("hiddenModalBack");
}
exports.showModalWindow = showModalWindow;
function update() {
    const combinationBoxes = document.querySelectorAll(".combination");
    if (combinationBoxes.length > 0) {
        exports.emptyCombinationsHint.style.display = "none";
        inputTrack.skeletons.forEach(element => {
            element.style.display = "none";
        });
        //combinationsBox!.style.backgroundImage = "url()";
    }
    else {
        exports.emptyCombinationsHint.style.display = "block";
        inputTrack.skeletons.forEach(element => {
            element.style.display = "block";
        });
        //combinationsBox!.style.backgroundImage = "url(resources/images/combinationsSkeleton.png)";
    }
    const combinationsPanel = document.getElementById("combinationsBox");
    const combinationConfigPanel = document.getElementById("combinationsSectionInner");
    copyCombinations(combinationsPanel, combinationConfigPanel);
    let draggables = document.querySelectorAll("#combinationsSectionInner .draggable");
    draggables.forEach(draggable => {
        new draggableEl.DraggableElement(draggable);
    });
}
exports.update = update;
function copyCombinations(source, target) {
    target.innerHTML = '';
    for (const child of source.children) {
        //child.classList.add("draggable");
        let clone = child.cloneNode(true);
        clone.classList.add("draggable");
        target.appendChild(clone);
    }
    const removeButtons = target.querySelectorAll(".combinationRemoveButton");
    removeButtons.forEach(button => {
        button.remove();
    });
}
