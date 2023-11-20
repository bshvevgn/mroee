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
exports.skeletons = exports.emptyCommandsHint = void 0;
const Json = __importStar(require("./json"));
const windowOperations = require('./windowOperations');
const keysInputBox = document.getElementById("keysInputBox");
const saveButton = document.getElementById("saveButton");
const saveButtonBack = document.querySelectorAll(".saveButtonBack");
const combinationsBox = document.getElementById("combinationsBox");
const clearButton = document.getElementById("clearInputButton");
const jsonFilePath = 'resources/config/config.json';
const editor = new Json.JsonEditor(jsonFilePath);
const combinations = [];
let buttonsCount = 0;
function trackKeyPress(event) {
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
function saveCombination() {
    const divs = keysInputBox.querySelectorAll("div");
    const innerTextArray = [];
    divs.forEach((div) => {
        if (div != clearButton && div != saveButton && div != saveButtonBack[0])
            innerTextArray.push(div.innerText);
    });
    let combinationText = innerTextArray.join(" + ");
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
    windowOperations.emptyCombinationsHint.style.display = "none";
    exports.skeletons.forEach(element => {
        element.style.display = "none";
    });
    //combinationsBox!.style.backgroundImage = "url()";
    divs.forEach((div) => {
        if (div != clearButton && div != saveButton && div != saveButtonBack[0]) {
            div.remove();
        }
    });
    clearButton.style.opacity = "0";
    const combinationDiv = document.createElement("div");
    const combinationTextBlock = document.createElement("p");
    combinationDiv.classList.add("combination");
    combinationDiv.classList.add("hiddenCombination");
    combinationDiv.classList.add("button");
    combinationTextBlock.innerHTML = combinationText;
    const combinationRemoveButton = document.createElement("div");
    combinationRemoveButton.classList.add("combinationRemoveButton");
    combinationDiv.appendChild(combinationRemoveButton);
    combinationDiv.appendChild(combinationTextBlock);
    combinationsBox.appendChild(combinationDiv);
    combinationDiv.addEventListener("click", () => removeCombination(combinationDiv));
    setTimeout(() => combinationDiv.classList.remove("hiddenCombination"), 10);
    buttonsCount = 0;
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
    setTimeout(() => { box.remove(); windowOperations.update(); }, 200);
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
exports.emptyCommandsHint = document.getElementById('emptyCommandsHint');
exports.skeletons = document.querySelectorAll(".combinationSkeleton");
function saveCommand() {
    const commandsArray = [];
    commandsArray.push(commandsBox.innerText);
    if (commandsBox.innerText = "") {
        keysInputBox.classList.add("shake");
        setTimeout(() => keysInputBox.classList.remove("shake"), 400);
        return;
    }
    exports.emptyCommandsHint.style.display = "none";
    exports.skeletons.forEach(element => {
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
