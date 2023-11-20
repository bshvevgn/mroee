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
exports.DraggableElement = void 0;
const connection = __importStar(require("./connection"));
const json = __importStar(require("./json"));
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
        //event.clientX - ball!.getBoundingClientRect().left - 42;
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
            //this.clone!.hidden = true;
            this.clone.style.display = "none";
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            this.clone.style.display = "block";
            //this.clone!.hidden = false;
            console.log(elemBelow === null || elemBelow === void 0 ? void 0 : elemBelow.innerHTML);
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
                const shortcut = this.textToShortcut(this.clone.querySelectorAll("p")[0].innerText);
                connection.globalPort.write("s" + numberOfScreen + "sc" + shortcut);
                console.log("s" + numberOfScreen + "sc" + shortcut);
                json.editor.editAttributeById(("button" + numberOfScreen), "shortcut", shortcut);
                this.clone.style.left =
                    this.underElement.getBoundingClientRect().left + (this.underElement.offsetWidth - this.clone.offsetWidth) / 2 + 'px';
                this.clone.style.top =
                    this.underElement.getBoundingClientRect().top + (this.underElement.offsetHeight - this.clone.offsetHeight) / 2 + 'px';
                //this.underElement!.style.backdropFilter = "blur(10px)";
                setTimeout(() => {
                    this.clone.style.filter = 'blur(20px)';
                    this.underElement.querySelectorAll(".previewIcon")[0].style.transition = ".2s";
                    this.underElement.querySelectorAll(".previewIcon")[0].style.opacity = "0";
                    this.clone.style.transform = 'scale(.6)';
                    this.underElement.classList.remove('droppableActive');
                }, 200);
                setTimeout(() => { this.underElement.style.backdropFilter = "blur(0px)"; this.underElement.querySelectorAll(".previewIcon")[0].style.opacity = "1"; }, 1300);
                setTimeout(() => this.underElement.querySelectorAll(".previewIcon")[0].style.transition = ".1s", 1500);
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
        return text.replace(/(\s)\+(\s)/g, ';').toLowerCase();
    }
}
exports.DraggableElement = DraggableElement;
