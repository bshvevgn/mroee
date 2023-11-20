import * as fs from 'fs';

interface JsonObject {
  id: string;
  icon?: string;
  shortcut?: string;
  list?: string[];
  [key: string]: any;
}

export class JsonEditor {
  private jsonData: JsonObject[];

  constructor(private filePath: string) {
    this.jsonData = this.loadJsonData();
  }

  private loadJsonData(): JsonObject[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Если файл не существует или возникает ошибка при чтении, возвращаем пустой массив
      return [];
    }
  }

  private saveJsonData(): void {
    const jsonDataString = JSON.stringify(this.jsonData, null, 2);
    fs.writeFileSync(this.filePath, jsonDataString, 'utf8');
  }

  findObjectById(id: string): JsonObject | undefined {
    return this.jsonData.find(obj => obj.id === id);
  }

  editAttributeById(id: string, attributeName: string, newValue: any): void {
    const obj = this.findObjectById(id);

    if (obj) {
      obj[attributeName] = newValue;
      this.saveJsonData();
    } else {
      console.info(`Object with id ${id} not found.`);
    }
  }

  createObject(id: string, icon: string, shortcut: string): void {
    const existingObj = this.findObjectById(id);

    if (existingObj) {
      console.info(`Object with id ${id} already exists.`);
    } else {
      const newObj: JsonObject = { id, icon, shortcut };
      this.jsonData.push(newObj);
      this.saveJsonData();
    }
  }

  createShortcutsList() {
    const existingObj = this.findObjectById("shortcutsList");

    if (existingObj) {
      console.info(`Object already exists.`);
    } else {
      let id = "shortcutsList";
      let list: string[] = [];
      const newObj: JsonObject = { id, list };
      this.jsonData.push(newObj);
      this.saveJsonData();
    }
  }

  addShortcut(shortcut: string) {
    const obj = this.findObjectById("shortcutsList");

    if (obj && obj.list) {
      obj.list.push(shortcut);
      this.saveJsonData();
    } else {
      console.info(`Object with "shortcuts" property not found.`);
    }
  }

  removeShortcut(shortcut: string) {
    const obj = this.findObjectById("shortcutsList");

    if (obj && obj.list) {
      var index = obj.list.indexOf(shortcut);

      let newList = obj.list;
      newList.splice(index, 1);

      if (index !== -1) {
        obj.list = newList;
      }

      this.saveJsonData();
    } else {
      console.info(`Object with "shortcuts" property not found.`);
    }
  }

  getShortcuts(): string[] | undefined {
    const obj = this.findObjectById("shortcutsList");
    console.log(obj?.id);
    if (obj && obj.list) {
      return obj.list;
    } else {
      console.error(`Object with "shortcuts" property not found.`);
      return undefined;
    }
  }
}

const jsonFilePath = 'resources/config/config.json';
export const editor = new JsonEditor(jsonFilePath);