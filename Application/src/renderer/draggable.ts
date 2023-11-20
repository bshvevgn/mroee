import * as connection from "./connection"
import * as json from "./json"

export class DraggableElement {
    private element: HTMLElement;
    private clone: HTMLElement | undefined;
    private underDroppable: boolean = false;
    private underElement: HTMLElement | null = null;
    private currentDroppable: HTMLElement | null = null;
    private originX: number = 0;
    private originY: number = 0;
    private shiftX: number = 0;
    private shiftY: number = 0;
  
    constructor(element: HTMLElement) {
      this.element = element as HTMLElement;
      this.element.addEventListener('mousedown', (this.onMouseDown.bind(this)));
      this.element.ondragstart = function () {
        return false;
      };
    }
  
    private onMouseDown(event: MouseEvent): void {
      this.originX = this.element.getBoundingClientRect().left;
      this.originY = this.element.getBoundingClientRect().top;
  
      const shiftX = event.clientX - this.element.getBoundingClientRect().left;
      const shiftY = event.clientY - this.element.getBoundingClientRect().top;
  
      //event.clientX - ball!.getBoundingClientRect().left - 42;
  
      this.shiftX = shiftX;
      this.shiftY = shiftY;
  
      this.clone = this.element.cloneNode(true) as HTMLElement;
      document.body.appendChild(this.clone);
  
      this.clone.style.position = 'absolute';
      this.clone.style.zIndex = '1000';
      this.clone.style.transform = 'scale(1)';
      this.clone.style.transition = ".2s";
      setTimeout(() => this.clone!.style.transform = 'scale(1.1)', 10);
      setTimeout(() => this.clone!.style.transition = "0s", 300);
      this.clone.id += 'Clone';
  
      this.element.style.transition = '0s';
      this.element.style.opacity = '0';
  
      this.moveAt(event.pageX, event.pageY);
  
      const onMouseMove = (event: { pageX: number; pageY: number; clientX: number; clientY: number; }) => {
        const previews = document.querySelectorAll<HTMLElement>(".previewIconBox");
        previews.forEach(preview => {
          preview.classList.add("dashedPreview");
        });
        this.moveAt(event.pageX, event.pageY);
        //this.clone!.hidden = true;
        this.clone!.style.display = "none";
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        this.clone!.style.display = "block";
        //this.clone!.hidden = false;
  
        console.log(elemBelow?.innerHTML);
  
        if (!elemBelow) return;
  
        const droppableBelow = elemBelow.closest('.droppable') as HTMLElement;
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
        const previews = document.querySelectorAll<HTMLElement>(".previewIconBox");
        previews.forEach(preview => {
          preview.classList.remove("dashedPreview");
        });
        document.removeEventListener('mousemove', onMouseMove);
        this.clone!.onmouseup = null;
        this.clone!.style.transition = '.3s';
        this.element.style.transition = '.3s';
        if (!this.underDroppable) {
          this.clone!.style.transform = 'scale(1)';
          this.clone!.style.left = this.originX + 'px';
          this.clone!.style.top = this.originY + 'px';
        } else {
          const numberOfScreen = this.underElement!.id.substring(7, 8);
          const shortcut = this.textToShortcut(this.clone!.querySelectorAll("p")[0].innerText)
          connection.globalPort.write("s" + numberOfScreen + "sc" + shortcut);
          console.log("s" + numberOfScreen + "sc" + shortcut);
          json.editor.editAttributeById(("button" + numberOfScreen), "shortcut", shortcut);
  
          this.clone!.style.left =
            this.underElement!.getBoundingClientRect().left + (this.underElement!.offsetWidth - this.clone!.offsetWidth) / 2 + 'px';
          this.clone!.style.top =
            this.underElement!.getBoundingClientRect().top + (this.underElement!.offsetHeight - this.clone!.offsetHeight) / 2 + 'px';
          //this.underElement!.style.backdropFilter = "blur(10px)";
          setTimeout(() => {
            this.clone!.style.filter = 'blur(20px)';
            this.underElement!.querySelectorAll<HTMLElement>(".previewIcon")[0]!.style.transition = ".2s";
            this.underElement!.querySelectorAll<HTMLElement>(".previewIcon")[0]!.style.opacity = "0";
            this.clone!.style.transform = 'scale(.6)';
            this.underElement!.classList.remove('droppableActive');
          }, 200);
  
          setTimeout(() => { this.underElement!.style.backdropFilter = "blur(0px)"; this.underElement!.querySelectorAll<HTMLElement>(".previewIcon")[0]!.style.opacity = "1"; }, 1300);
          setTimeout(() => this.underElement!.querySelectorAll<HTMLElement>(".previewIcon")[0]!.style.transition = ".1s", 1500);
        }
        setTimeout(() => (this.clone!.style.opacity = '0'), 300);
        setTimeout(() => (this.element.style.opacity = '1'), 200);
        setTimeout(() => { this.clone!.remove(); }, 600);
      };
    }
  
    private moveAt(pageX: number, pageY: number): void {
      this.clone!.style.left = pageX - this.shiftX + 'px';
      this.clone!.style.top = pageY - this.shiftY + 'px';
    }
  
    private enterDroppable(elem: HTMLElement): void {
      elem.classList.add('droppableActive');
      this.underDroppable = true;
      this.underElement = elem;
    }
  
    private leaveDroppable(elem: HTMLElement): void {
      elem.classList.remove('droppableActive');
      this.underDroppable = false;
    }
  
    private textToShortcut(text: string): string {
      return text.replace(/(\s)\+(\s)/g, ';').toLowerCase();
    }
  
  
  }