setTimeout(() => document.getElementById('preloader')?.classList.add('hiddenPreloader'), 2000);

const { SerialPort } = require('serialport')

let isConnected = true;
let receivedData = false;
let globalPortName = '';

let globalPort = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});

let accumulatedData: string = ''

function parseData(data: string, portName: string) {
  console.log("parsing");
  const regex = /^SwiftController;S\/N(\d+)/;
  const match = data.match(regex);
  if (match) {
    receivedData = true;
    const [, serialNumber] = match;
    console.log(`Найдено соответствие на порту ${portName}: serialNumber = ${serialNumber}`);
    document.getElementById('serialNumber')!.innerHTML = "S/N: " + serialNumber;
  }
}

let port = new SerialPort({
  path: 'COM1',
  baudRate: 115200
});

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
      console.log(`Ошибка на порту ${portName}: ${err.message}`);
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
      console.log(`Ошибка на порту ${globalPortName}: ${err.message}`);
      reject(err);
    });
  });
}


const portNames = ['/dev/cu.usbserial-0001', '/dev/cu.usbserial-0002', 'COM1', 'COM2', 'COM3', 'COM4'];

async function main() {
  console.log("Port opened: " + globalPort.isOpen + " Connected: " + isConnected);

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
      await readData();
      port.removeAllListeners('error');
      port.removeAllListeners('open');
    }
  }
}

setInterval(() => main(), 500);

globalPort.on('close', function () {
  isConnected = false;
});

globalPort.on('error', function () {
  isConnected = false;
});



class IconsPopup {
  private element: HTMLElement;
  private menuOpened: boolean = false;
  private numberOfScreen = "";

  constructor(element: HTMLElement) {
    this.element = element;
    let menuOpened = this.menuOpened;
    this.numberOfScreen = this.element.id.substring(7, 8);
    this.element.addEventListener('click', this.operateMenu.bind(this));
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
      this.addMenu();
    }
  }

  private closeMenu() {
    const menu = this.element.querySelectorAll<HTMLTableElement>(".iconMenu")[0];
    menu.classList.add('hidden');
    setTimeout(() => menu.remove(), 200);
    this.menuOpened = false;
  }

  private addMenu() {
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

    const innerIcon = this.element.querySelectorAll<HTMLTableElement>(".previewIcon")[0];

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

const previewIconBoxes = document.querySelectorAll<HTMLTableElement>('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
  new IconsPopup(previewIconBox);
});

const asideButtons = document.querySelectorAll<HTMLTableElement>('.asideButton');
const contentBoxes = document.querySelectorAll<HTMLTableElement>('.content');

function selectContent(button: HTMLElement) {
  update();

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




function closeModalWindow(ID: string) {
  document.getElementById(ID + "Window")!.classList.add('closedModalWindow');
  document.getElementById("modalWindowBack")!.classList.add("hiddenModalBack");
}

function showModalWindow(ID: string) {
  //document.getElementById(ID + "Window")!.classList.remove('closedModalWindow');
  //document.getElementById("modalWindowBack")!.classList.remove("hiddenModalBack");
}


const keysInputBox = document.getElementById("keysInputBox") as HTMLDivElement;
const saveButton = document.getElementById("saveButton") as HTMLDivElement;
const combinationsBox = document.getElementById("combinationsBox") as HTMLDivElement;
const clearButton = document.getElementById("clearInputButton") as HTMLDivElement;

const combinations: string[] = [];

let buttonsCount = 0;
function trackKeyPress(event: KeyboardEvent) {
  buttonsCount++

  if(buttonsCount > 0){
    clearButton.style.opacity = "1";
  } else {
    clearButton.style.opacity = "0";
  }

  if (buttonsCount < 5) {
    event.preventDefault();
    let keyName = event.key;

    if (keyName == " "){
        keyName = "space";
    }

    const keyDiv = document.createElement("div");
    keyDiv.textContent = keyName.toUpperCase();
    keyDiv.classList.add("keyBox");

    if(buttonsCount == 1) keyDiv.classList.add("firstKey");

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
    if(div != clearButton){
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
    if(div != clearButton) innerTextArray.push(div.innerText);
  });

  let combinationText = innerTextArray.join(" + ");

  if (combinationText == null) {
    combinationText = "";
  }

  if(divs.length == 1){
    keysInputBox!.classList.add("shake");
    setTimeout(() => keysInputBox!.classList.remove("shake"), 400);
    return;
  }

  combinations.push(combinationText);

  emptyCombinationsHint!.style.display = "none";

  divs.forEach((div) => {
    if(div != clearButton){
      div.remove();
    }
  });

  clearButton.style.opacity = "0";

  const combinationDiv = document.createElement("div");
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
      if(!listenKeys) keysListener();
    } else {
      targetElement.classList.remove('active');
      if(listenKeys) keysListener();
    }
  });
}


function keysListener(){
  if(listenKeys){
    document.removeEventListener("keydown", trackKeyPress);
    listenKeys = !listenKeys;
  } else {
    document.addEventListener("keydown", trackKeyPress);
    listenKeys = !listenKeys;
  }
}


function removeCombination(box: HTMLElement) {
  box.classList.add("hiddenCombination");
  setTimeout(() => {box.remove(); update()}, 200);
}

function update(){
  const combinationBoxes = document.querySelectorAll(".combination") as NodeListOf<HTMLElement>;
  if(combinationBoxes.length > 0){
    emptyCombinationsHint!.style.display = "none";
  } else {
    emptyCombinationsHint!.style.display = "block";
  }
}



