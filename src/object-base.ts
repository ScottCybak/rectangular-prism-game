import { Coordinates } from "coordinates";

export interface ObjectBaseModel {
    position: Coordinates;
    size: Coordinates;
}

interface Box {
    top: number;
    left: number;
    width: number;
    height: number;
    center: [number, number];
}

const defaultBox: Box = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    center: [0, 0],
}

export type XY = [number /* centerX */, number /* centerY */];

export abstract class ObjectBase<T extends ObjectBaseModel> {

    private element = document.createElement('div');
    
    protected shadow = this.element.attachShadow({mode: 'open'});
    protected stylesheet = new CSSStyleSheet();

    limits: Box = { ...defaultBox } ;
    
    constructor(protected readonly data: T) {
        const superSheet = new CSSStyleSheet();
        superSheet.replaceSync(`
            * {
                box-sizing: border-box;
            }
            :host {
                perspective: 400px;
            }
        `)
        this.shadow.adoptedStyleSheets = [this.stylesheet, superSheet];

        const [left, top] = data.position;
        const [width, height] = data.size;
        const e = this.element;
        e.classList.add('object', `object-${(data as any).type}`);
        e.style.left = `${left}px`;
        e.style.top = `${top}px`;

        this.limits = {
            left,
            top,
            width,
            height,
            center: [left + (width / 2), top + (height / 2)]
        }
    }

    recalculate([centerX, centerY]: XY) {
        const e = this.element;
        const originX = 50 + (100 - (Math.round(this.limits.center[0] / centerX * 100000) / 1000)) * 25;
        const originY = 50 + (100 - (Math.round(this.limits.center[1] / centerY * 100000) / 1000)) * 25;
        // console.log(originX)
        // console.log({
        //     a: Math.round(data.centerX / this.limits.center[0] * 100),
        //     b: Math.round(this.limits.center[0] / data.centerX * 100),
        //     test1: 150 - Math.round(this.limits.center[0] / data.centerX * 100),
        // })
        e.style.setProperty('-webkit-perspective-origin-x', `${originX}%`);
        e.style.setProperty('-webkit-perspective-origin-y', `${originY}%`);
    }

    abstract create(): this;

    place(appendAsChildTo: HTMLElement) {
        appendAsChildTo.appendChild(this.element);
        return this;
    }
}