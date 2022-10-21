/// <reference path="../src/firebase.d.ts" />
declare function ses(e: HTMLElement, s: {
    [key: string]: string;
}): void;
declare let firestore: any;
declare function sleep(ms: number): Promise<unknown>;
declare class Chat {
    static topMessageText: string;
    static chatbox: HTMLDivElement;
    static messages: HTMLDivElement;
    static textbox: HTMLInputElement;
    static isInitialized: boolean;
    static isShowing: boolean;
    static loadState: number;
    static username: string;
    static db: any;
    static prepare(pageNum: number): void;
    static getFormsData(): void;
    static setUsername(un: string): void;
    static initialize(): void;
    static didLoad(): Promise<void>;
    static show(): void;
    static hide(): void;
    static toggle(): void;
    static sendData(dat: string): void;
    static displayMessage(name: string, when: string, value: string): void;
}
declare class Search {
    static box: HTMLDivElement;
    static isInitialized: boolean;
    static isShowing: boolean;
    static prepare(): void;
    static initialize(): void;
    static show(): void;
    static hide(): void;
    static toggle(): void;
}
