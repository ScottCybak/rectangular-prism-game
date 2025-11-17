import { Coordinates } from "coordinates";
import { TileController } from "tile-controller";
import { Watched } from "watched";

export interface ObjectBaseModel {
    position?: Coordinates;
    size?: Coordinates;
    rotate?: Coordinates;
}

export abstract class ObjectBase<T extends ObjectBaseModel> {

    abstract create(): this;
    abstract doesPointIntersect(point: Coordinates, radius: number): boolean;
    abstract containsPoint(point: Coordinates): boolean;
    abstract hideByCoordinates(point: Coordinates): boolean;
    abstract recalculateDimensions(): void;

    offscreen!: Watched<boolean>;

    width = 0;
    height = 0;
    top = 0;
    left = 0;

    protected isHidden = new Watched(false);
    
    protected element = document.createElement('div');
    
    constructor(public readonly data: T) {
        const [x, y, z] = data.position ?? [0, 0, 0];
        const [width, height, depth] = data.size ?? [0, 0, 0];
        const [rx, ry, rz] = data.rotate ?? [0, 0, 0];
        const { element } = this;
        element.classList.add('object', `object-${(data as any).type}`);
        element.style.cssText = `
            --x: ${this.left = x}px;
            --y: ${this.top = y}px;
            --z: ${z}px;
            --w: ${this.width = width}px;
            --l: ${this.height = height}px;
            --h: ${depth}px;
            --neg-d: ${-depth}px;
            --r-x: ${rx}deg;
            --r-y: ${ry}deg;
            --r-z: ${rz}deg;
        `;

        this.isHidden.watch(is => {
            this.element.classList[is ? 'add' : 'remove']('hidden');
        });
    }

    place(appendAsChildTo: HTMLElement): this {
        appendAsChildTo.appendChild(this.element);
        return this;
    }

    addToTile(tileController: TileController): this {
        tileController.add(this);
        this.offscreen = new Watched(true);
        this.offscreen.watch(is => {
            this.element.classList[is ? 'add' : 'remove']('offscreen');
        })
        return this;
    }
}