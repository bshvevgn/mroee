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
exports.editor = exports.JsonEditor = void 0;
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
            // Если файл не существует или возникает ошибка при чтении, возвращаем пустой массив
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
    createObject(id, icon, shortcut) {
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
exports.JsonEditor = JsonEditor;
const jsonFilePath = 'resources/config/config.json';
exports.editor = new JsonEditor(jsonFilePath);
