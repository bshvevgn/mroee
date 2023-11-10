setTimeout(() => document.getElementById('preloader')?.classList.add('hiddenPreloader'), 2000);
setTimeout(() => document.getElementById('logoAnimation')!.style.display = "none", 2300);

const { SerialPort } = require('serialport')

let isConnected = true;
let receivedData = false;
let globalPortName = '';
let globalPort = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});
let port = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});
const portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', 'COM1', 'COM2', 'COM3', 'COM4'];


let accumulatedData: string = ''

function parseData(data: string, portName: string) {
  const regex = /^SwiftController;S\/N(\d+)/;
  const match = data.match(regex);
  if (match) {
    receivedData = true;
    const [, serialNumber] = match;
    console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
    document.getElementById('serialNumber')!.innerHTML = "S/N: " + serialNumber;
  }
}

async function connectTo(portName: string) {
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

  return new Promise<void>((resolve, reject) => {
    port.on('error', (err: { message: any; }) => {
      isConnected = false; //-----
      //console.log(`Ошибка на порту ${portName}: ${err.message}`);
      reject(err);
    });
  });
}

async function readData() {
  globalPort.on('data', (data: { toString: () => any; }) => {

    const dataStr = data.toString();
    accumulatedData += dataStr;
    parseData(accumulatedData, globalPortName);
  });

  globalPort.on('close', function () {
    isConnected = false;
  });

  return new Promise<void>((resolve, reject) => {
    globalPort.on('error', (err: { message: any; }) => {
      isConnected = false; //-----
      //console.log(`Ошибка на порту ${globalPortName}: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  //console.log("Port opened: " + globalPort.isOpen + " Connected: " + isConnected);

  if (isConnected) {
    closeModalWindow('connection');
  } else {
    showModalWindow('connection');
  }

  if (!isConnected) {
    for (const portName of portNames) {
      try {
        await connectTo(portName);
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    if (!receivedData) {
      try {
        await readData();
      } catch (err) {
        console.log(err);
      }
    } else {
      //await readData();
      port.removeAllListeners('error');
      port.removeAllListeners('open');
    }
  }
}

globalPort.on('close', function () {
  isConnected = false;
});

globalPort.on('error', function () {
  isConnected = false;
});

setInterval(() => main(), 1500);

const iconNames = ['copy', 'paste', 'mute', 'volumeup', 'volumedown', 'pause', 'play', 'backward', 'forward', 'screenshot', 'search', 'moon', 'lock'];
const names = ['Копировать', 'Вставить', 'Без звука', 'Громкость +', 'Громкость -', 'Пауза', 'Продолжить', 'Назад', 'Вперёд', 'Снимок экрана', 'Поиск', 'Не беспокоить', 'Заблокировать'];


class SettingsPopup {
  private element: HTMLElement;
  private menuOpened: boolean = false;
  private numberOfScreen = "";

  constructor(element: HTMLElement) {
    this.element = element;
    this.numberOfScreen = this.element.id.substring(7, 8);
    this.element.addEventListener('click', () => this.operateMenu());
  }

  private checkMenu() {
    if (this.menuOpened) {
      this.closeMenu();
    }
  }

  private operateMenu() {
    if (this.menuOpened) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private closeMenu() {
    const menu = document.querySelector<HTMLElement>("#menu" + this.element.id.substring(7, 8));
    this.element.classList.remove('activePreview');
    menu!.classList.add('hidden');
    setTimeout(() => menu!.remove(), 200);
    this.menuOpened = false;
  }

  private openMenu() {
    this.menuOpened = true;
    this.element?.classList.add('activePreview');

    let menu: HTMLDivElement = document.createElement("div");
    menu.classList.add("iconMenu");
    menu.classList.add("hidden");
    menu.id = "menu" + this.element.id.substring(7, 8);

    const menuHTML = `
          <div class="categories">
            <div class="category iconsCategory"><p>Значки</p></div>
            <div class="category functionsCategory"><p>Сочетания</p></div>
            <div class="category functionsCategory"><p>Команды</p></div>
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

    const iconButtons = document.querySelectorAll<HTMLTableElement>(".iconElement");
    iconButtons.forEach(button => {
      button.addEventListener('click', () => this.operateMenu());
    });

    menu.style.position = "absolute";
    menu.style.zIndex = "1000";
    menu.style.left = this.element.getBoundingClientRect().left + "px";
    menu.style.top = this.element.getBoundingClientRect().top + "px";
    document.querySelector("body")?.appendChild(menu);
    setTimeout(() => menu.classList.remove('hidden'), 10);
  }

}

function handleIconClick(numberOfScreen: number, index: number) {
  const innerIcon = document.querySelectorAll<HTMLTableElement>(".previewIcon")[numberOfScreen - 1];
  const iconName = iconNames[index];
  console.log("s" + numberOfScreen + "i" + index);
  innerIcon.style.backgroundImage = `url(resources/icons/${iconName}.png)`;
  innerIcon.style.animation = "bounce .2s ease-in-out running";
  globalPort.write("s" + numberOfScreen + "i" + index);
  setTimeout(() => innerIcon.style.animation = "none", 200);
}

const previewIconBoxes = document.querySelectorAll<HTMLTableElement>('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
  new SettingsPopup(previewIconBox);
});

const asideButtons = document.querySelectorAll<HTMLTableElement>('.asideButton');
const contentBoxes = document.querySelectorAll<HTMLTableElement>('.content');

function selectContent(button: HTMLElement) {
  update();

  let buttonID = button.id;
  let id = buttonID.substring(0, buttonID.length - 6);

  if(id !== "iconsSet") {
    document.getElementById("connectionWidget")?.classList.remove("hiddenAsideWidget");
  } else {
    document.getElementById("connectionWidget")?.classList.add("hiddenAsideWidget");
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


function closeModalWindow(ID: string) {
  document.getElementById(ID + "Window")!.classList.add('closedModalWindow');
  document.getElementById("modalWindowBack")!.classList.add("hiddenModalBack");
}

function showModalWindow(ID: string) {
  document.getElementById(ID + "Window")!.classList.remove('closedModalWindow');
  document.getElementById("modalWindowBack")!.classList.remove("hiddenModalBack");
}


const keysInputBox = document.getElementById("keysInputBox") as HTMLDivElement;
const saveButton = document.getElementById("saveButton") as HTMLDivElement;
const saveButtonBack = document.querySelectorAll<HTMLTableElement>(".saveButtonBack");
const combinationsBox = document.getElementById("combinationsBox") as HTMLDivElement;
const clearButton = document.getElementById("clearInputButton") as HTMLDivElement;

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

const emptyCombinationsHint = document.getElementById('emptyCombinationsHint');

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

  emptyCombinationsHint!.style.display = "none";
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

setActive(keysInputBox);

function setActive(targetElement: HTMLElement, containerElement: HTMLElement | Document = document) {
  containerElement.addEventListener('click', (event) => {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement === targetElement || targetElement.contains(clickedElement)) {
      targetElement.classList.add('active');
      if (!listenKeys) keysListener();
    } else {
      targetElement.classList.remove('active');
      if (listenKeys) keysListener();
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
  setTimeout(() => { box.remove(); update() }, 200);
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

const emptyCommandsHint = document.getElementById('emptyCommandsHint');
const skeletons = document.querySelectorAll(".combinationSkeleton") as NodeListOf<HTMLElement>;

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


/*function removeCombination(box: HTMLElement) {
  box.classList.add("hiddenCombination");
  setTimeout(() => {box.remove(); update()}, 200);
}*/

function update() {
  const combinationBoxes = document.querySelectorAll(".combination") as NodeListOf<HTMLElement>;
  if (combinationBoxes.length > 0) {
    emptyCombinationsHint!.style.display = "none";
    skeletons.forEach(element => {
      element.style.display = "none";
    });
    //combinationsBox!.style.backgroundImage = "url()";
  } else {
    emptyCombinationsHint!.style.display = "block";
    skeletons.forEach(element => {
      element.style.display = "block";
    });
    //combinationsBox!.style.backgroundImage = "url(resources/images/combinationsSkeleton.png)";
  }
}











const noble = require('@abandonware/noble');
const readline = require('readline');

// Инициализация noble
noble.on('stateChange', (state: string) => {
  if (state === 'poweredOn') {
    // Начинаем поиск устройств с заданным именем (например, "mroee")
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

// Обработка обнаруженных устройств
noble.on('discover', (peripheral: { advertisement: { localName: string; txPowerLevel: string}; }) => {
   console.log("------ " + peripheral.advertisement.localName);
  // Проверяем имя устройства
  if (peripheral.advertisement.localName === 'mroee') {

    // Подключаемся к устройству
    noble.stopScanning();
    connectToDevice(peripheral);
  }
});

// Функция подключения к устройству
function connectToDevice(peripheral: { advertisement?: { localName: string; }; connect?: any; disconnect?: any; }) {
  peripheral.connect((error: any) => {
    if (error) {
      console.error('Ошибка подключения к устройству:', error);
      return;
    }

    console.log('Успешное подключение к устройству!');

    sendStringToDevice(peripheral);
  });
}

function sendStringToDevice(peripheral: { advertisement?: { localName: string; } | undefined; connect?: any; disconnect?: any; discoverServices?: any; }) {
  let characteristics = peripheral.discoverServices();
  //alert(characteristics);
}