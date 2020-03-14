export { SendName, word_content, chooseDis, WordShow, WordDis };
declare let word_content: HTMLElement;
declare function WordShow(container: any, content: string, interval: number, action: () => void): void;
declare function WordDis(container: any, interval: number, action: () => void): void;
declare function SendName(ws: any): void;
declare function chooseDis(): void;
