import * as Connection from "./connection"
import * as json from "./json"
import * as inputTrack from "./inputTrack"
import * as draggableEl from "./draggable"

//editor.editAttributeById('someId', 'icon', 'newIcon');

setTimeout(() => document.getElementById('preloader')?.classList.add('hiddenPreloader'), 2000);
setTimeout(() => document.getElementById('logoAnimation')!.style.display = "none", 2300);

addEventListener("load", (event) => {
  json.editor.createObject('button1', 'copy', 'meta;c');
  json.editor.createObject('button2', 'paste', 'meta;v');
  json.editor.createObject('button3', 'moon', 'meta;control;d');
  json.editor.createObject('button4', 'lock', 'meta;shift;q');
  json.editor.createShortcutsList();

  for (let i = 1; i < 5; i++) {
    const iconBox = document.getElementById("iconBox" + i)!.querySelectorAll<HTMLElement>(".previewIcon")[0]!;
    const iconPath = `url(resources/icons/${json.editor.findObjectById("button" + i)!["icon"]}.png)`;

    iconBox.style.backgroundImage = iconPath;
    //alert(iconBox.style.backgroundImage);
  }

  //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].style.backgroundImage);
  //alert(document.getElementById("iconBox1")!.querySelectorAll<HTMLElement>(".previewIcon")[0].classList);
});

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

export const emptyCombinationsHint = document.getElementById('emptyCombinationsHint');
const iconNames = ['copy', 'paste', 'mute', 'volumeup', 'volumedown', 'pause', 'play', 'backward', 'forward', 'screenshot', 'search', 'moon', 'lock'];
const names = ['Копировать', 'Вставить', 'Без звука', 'Громкость +', 'Громкость -', 'Пауза', 'Продолжить', 'Назад', 'Вперёд', 'Снимок экрана', 'Поиск', 'Не беспокоить', 'Заблокировать'];

function handleIconClick(numberOfScreen: number, index: number) {
    const innerIcon = document.querySelectorAll<HTMLTableElement>(".previewIcon")[numberOfScreen - 1];
    const iconName = iconNames[index];

    console.log("s" + numberOfScreen + "i" + index);
    json.editor.editAttributeById(("button" + numberOfScreen), "icon", iconNames[index])

    innerIcon.style.backgroundImage = `url(resources/icons/${iconName}.png)`;
    innerIcon.style.animation = "bounce .2s ease-in-out running";
    Connection.globalPort.write("s" + numberOfScreen + "i" + index);
    setTimeout(() => innerIcon.style.animation = "none", 200);
}

const previewIconBoxes = document.querySelectorAll<HTMLTableElement>('.previewIconBox');
previewIconBoxes.forEach((previewIconBox) => {
    new SettingsPopup(previewIconBox);
});

const asideButtons = document.querySelectorAll<HTMLTableElement>('.asideButton');
const contentBoxes = document.querySelectorAll<HTMLTableElement>('.content');

function selectContent(button: HTMLElement) {
    setTimeout(() => update(), 300);

    let buttonID = button.id;
    let id = buttonID.substring(0, buttonID.length - 6);

    if (id !== "iconsSet") {
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


export function closeModalWindow(ID: string) {
    document.getElementById(ID + "Window")!.classList.add('closedModalWindow');
    document.getElementById("modalWindowBack")!.classList.add("hiddenModalBack");
}

export function showModalWindow(ID: string) {
    console.log(ID);
    document.getElementById(ID + "Window")!.classList.remove('closedModalWindow');
    document.getElementById("modalWindowBack")!.classList.remove("hiddenModalBack");
}

export function update() {
    const combinationBoxes = document.querySelectorAll(".combination") as NodeListOf<HTMLElement>;
    if (combinationBoxes.length > 0) {
        emptyCombinationsHint!.style.display = "none";
        inputTrack.skeletons.forEach(element => {
            element.style.display = "none";
        });
        //combinationsBox!.style.backgroundImage = "url()";
    } else {
        emptyCombinationsHint!.style.display = "block";
        inputTrack.skeletons.forEach(element => {
            element.style.display = "block";
        });
        //combinationsBox!.style.backgroundImage = "url(resources/images/combinationsSkeleton.png)";
    }

    const combinationsPanel = document.getElementById("combinationsBox");
    const combinationConfigPanel = document.getElementById("combinationsSectionInner");
    copyCombinations(combinationsPanel, combinationConfigPanel);

    let draggables = document.querySelectorAll<HTMLElement>("#combinationsSectionInner .draggable");

    draggables.forEach(draggable => {
        new draggableEl.DraggableElement(draggable);
    });
}

function copyCombinations(source: HTMLElement | null, target: HTMLElement | null) {
    target!.innerHTML = '';
  
    for (const child of source!.children) {
      //child.classList.add("draggable");
      let clone = child.cloneNode(true) as HTMLElement;
      clone.classList.add("draggable");
      target!.appendChild(clone);
    }
  
    const removeButtons = target!.querySelectorAll(".combinationRemoveButton") as NodeListOf<HTMLElement>;
    removeButtons.forEach(button => {
      button.remove();
    });
  }