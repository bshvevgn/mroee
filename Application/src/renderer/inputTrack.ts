import * as Json from "./json"
const windowOperations = require('./windowOperations');

const keysInputBox = document.getElementById("keysInputBox") as HTMLDivElement;
const saveButton = document.getElementById("saveButton") as HTMLDivElement;
const saveButtonBack = document.querySelectorAll<HTMLTableElement>(".saveButtonBack");
const combinationsBox = document.getElementById("combinationsBox") as HTMLDivElement;
const clearButton = document.getElementById("clearInputButton") as HTMLDivElement;

const jsonFilePath = 'resources/config/config.json';
const editor = new Json.JsonEditor(jsonFilePath);

const combinations: string[] = [];

let buttonsCount = 0;
function trackKeyPress(event: KeyboardEvent) {
  buttonsCount++

  if (buttonsCount > 0) {
    clearButton.style.opacity = "1";
  } else {
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

    if (buttonsCount == 1) keyDiv.classList.add("firstKey");

    keyDiv.classList.add("hiddenKey");
    keysInputBox.appendChild(keyDiv);
    setTimeout(() => keyDiv.classList.remove("hiddenKey"), 10);
  }
}

function clearCombination() {
  const divs = keysInputBox.querySelectorAll("div");
  const innerTextArray: string[] = [];
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
  const innerTextArray: string[] = [];

  divs.forEach((div) => {
    if (div != clearButton && div != saveButton && div != saveButtonBack[0]) innerTextArray.push(div.innerText);
  });

  let combinationText = innerTextArray.join(" + ");

  if (combinationText == null) {
    combinationText = "";
  }

  if (divs.length == 3) {
    keysInputBox!.classList.add("shake");
    setTimeout(() => keysInputBox!.classList.remove("shake"), 400);
    return;
  }

  combinations.push(combinationText);
  editor.addShortcut(combinationText);

  windowOperations.emptyCombinationsHint!.style.display = "none";
  skeletons.forEach(element => {
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

function setActive(targetElement: HTMLElement, containerElement: HTMLElement | Document = document) {
  containerElement.addEventListener('click', (event) => {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement === targetElement /*|| targetElement.contains(clickedElement)*/) {
      targetElement!.classList.add('active');
      if (!listenKeys) keysListener();
    } else {
      if (targetElement != null) {
        targetElement!.classList.remove('active');
        if (listenKeys) keysListener();
      }
    }
  });
}



function keysListener() {
  if (listenKeys) {
    document.removeEventListener("keydown", trackKeyPress);
    listenKeys = !listenKeys;
  } else {
    document.addEventListener("keydown", trackKeyPress);
    listenKeys = !listenKeys;
  }
}


function removeCombination(box: HTMLElement) {
  box.classList.add("hiddenCombination");
  editor.removeShortcut(box.querySelectorAll<HTMLElement>("p")[0].innerText);
  setTimeout(() => { box.remove(); windowOperations.update() }, 200);
}

const terminalInputBox = document.getElementById("terminalInputBox") as HTMLDivElement;
const saveTerminalButton = document.getElementById("saveTerminalButton") as HTMLDivElement;
const commandsBox = document.getElementById("treminalCommandsBox") as HTMLDivElement;
const clearCommandButton = document.getElementById("clearTerminalInputButton") as HTMLDivElement;

const commands: string[] = [];

let commandLength = 0;

function trackInput(event: KeyboardEvent) {
  commandLength++

  if (buttonsCount > 0) {
    clearButton.style.opacity = "1";
  } else {
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

    if (buttonsCount == 1) keyDiv.classList.add("firstKey");

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

export const emptyCommandsHint = document.getElementById('emptyCommandsHint');
export const skeletons = document.querySelectorAll(".combinationSkeleton") as NodeListOf<HTMLElement>;

function saveCommand() {
  const commandsArray: string[] = [];

  commandsArray.push(commandsBox.innerText);

  if (commandsBox.innerText = "") {
    keysInputBox!.classList.add("shake");
    setTimeout(() => keysInputBox!.classList.remove("shake"), 400);
    return;
  }

  emptyCommandsHint!.style.display = "none";
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