import { Coordinates } from "coordinates";
import { objectMap } from "objects/object-map";
import { TileController } from "tile-controller";
import { Watched } from "watched";
import { World } from "world";

export interface ObjectBaseModel {
    position?: Coordinates;
    size?: Coordinates;
    rotate?: Coordinates;
    label?: string;
}

export abstract class ObjectBase<T extends ObjectBaseModel> {

    abstract create(): this;
    abstract hideByCoordinates(point: Coordinates): boolean;

    label!: string;

    offscreen!: Watched<boolean>;

    width = 0;
    height = 0;
    depth = 0;
    top = 0;
    left = 0;
    base = 0;

    protected isHidden = new Watched(false);
    
    element = document.createElement('div');
    
    constructor(
        public readonly data: T,
        public world: World,
    ) {
        const pos = data.position ?? [0, 0, 0];
        const [width, height, depth] = data.size ?? [0, 0, 0];
        const [rx, ry, rz] = data.rotate ?? [0, 0, 0];
        const { element } = this;
        objectMap.set(element, this);
        element.classList.add('object', `object-${(data as any).type}`);
        element.style.cssText = `
            --w: ${this.width = width}px;
            --l: ${this.height = height}px;
            --h: ${this.depth = depth}px;
            --neg-d: ${-depth}px;
            --r-x: ${rx}deg;
            --r-y: ${ry}deg;
            --r-z: ${rz}deg;
        `;
        this.move(pos);
        if (data.label) this.label = data.label;

        this.isHidden.watch(is => {
            this.element.classList[is ? 'add' : 'remove']('hidden');
        });
    }

    move(to: Coordinates) {
        const { element } = this;
        element.style.setProperty('--x', `${this.left = to[0]}px`);
        element.style.setProperty('--y', `${this.top = to[1]}px`);
        element.style.setProperty('--z', `${this.base = to[2]}px`);
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