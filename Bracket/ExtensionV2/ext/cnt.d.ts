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
declare class Physics {
    static box: HTMLDivElement;
    static isInitialized: boolean;
    static isShowing: boolean;
    static prepare(): void;
    static initialize(): void;
    static show(): void;
    static hide(): void;
    static toggle(): void;
}
declare enum OutType {
    NORMAL = 0,
    LATEX = 1
}
declare class Num {
    num: number;
    digits: number;
    constructor(num?: string);
    toFloat(): number;
    toString(a?: OutType): string;
    copy(): Num;
}
declare class Result {
    eqs: string[];
    n: Num;
    latex: boolean;
    mult: string;
    div: string;
    arrow: string;
    constructor(num: Num, latex?: boolean);
    nStr(): string;
    multiply(f: number): void;
    divide(f: number): void;
    toString(): string;
}
declare const specialConversions: {
    [key: string]: (string | number)[][];
};
declare const conversions: {
    [key: string]: number;
};
declare function getConversion(unit: string): [string, number];
declare function getFinalConv(unit: string): number;
declare function leftExp(unit: string): string;
declare function rightExp(unit: string): number;
declare function convert(str: string): Result;
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
