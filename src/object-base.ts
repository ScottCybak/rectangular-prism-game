import { Coordinates } from "coordinates";
import { Watched } from "watched";

export interface ObjectBaseModel {
    position: Coordinates;
    size: Coordinates;
    rotate?: Coordinates;
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

    abstract create(): this;
    abstract doesPointIntersect(point: Coordinates, radius: number): boolean;
    abstract containsPoint(point: Coordinates): boolean;
    abstract hideByCoordinates(point: Coordinates): boolean;

    protected isHidden = new Watched(false);
    
    protected element = document.createElement('div');

    limits: Box = { ...defaultBox };
    
    constructor(public readonly data: T) {
        const [x, y, z] = data.position;
        const [width, height, depth] = data.size;
        const [rx, ry, rz] = data.rotate ?? [0, 0, 0];
        const { element } = this;
        element.classList.add('object', `object-${(data as any).type}`);
        element.style.cssText = `
            --x: ${x}px;
            --y: ${y}px;
            --z: ${z}px;
            --w: ${width}px;
            --l: ${height}px;
            --h: ${depth}px;
            --neg-d: ${-depth}px;
            --r-x: ${rx}deg;
            --r-y: ${ry}deg;
            --r-z: ${rz}deg;
        `;

        this.limits = {
            left: x,
            top: y,
            width,
            height,
            center: [x + (width / 2), y + (height / 2)]
        }

        this.isHidden.watch(is => {
            this.element.classList[is ? 'add' : 'remove']('hidden');
        })
    }

    place(appendAsChildTo: HTMLElement) {
        appendAsChildTo.appendChild(this.element);
        return this;
    }
}