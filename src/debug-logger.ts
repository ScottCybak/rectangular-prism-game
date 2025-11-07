import { ReadonlyWatched, Watched } from "watched";

class DebugLogger {

    private element = document.createElement('div');
    
    constructor() {
        const e = this.element;
        e.classList.add('debug-logger');
        document.body.appendChild(e);
    }

    watch(what: Watched<any> | ReadonlyWatched<any>, id: string) {
        const e = document.createElement('div');
        e.classList.add('debug-logger-watched');
        this.element.appendChild(e);
        what.watch(v => e.innerHTML = `${id}: ${v}`);
    }
}

export const debugLogger = new DebugLogger();