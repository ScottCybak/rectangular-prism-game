import { Coordinates } from "coordinates";
import { createDiv } from "create-div";
import { Watched } from "watched";
import { World } from "world";

export interface CreatureBaseModel {
    isPlayer?: boolean;
    size: Coordinates;
    position: Coordinates;
}

export abstract class CreatureBase<T extends CreatureBaseModel> {

    protected readonly position = new Watched<Coordinates>([0, 0, 0]);
    protected readonly element = createDiv();
    protected readonly size = new Watched<Coordinates>([0, 0, 0]);

    abstract create(): this;

    constructor(
        data: T,
        protected readonly world: World,
    ) {
        this.position.watch(pos => this.onPositionChange(pos));

        this.position.set(data.position);
        this.size.set(data.size);
        this.element.classList.add('creature');
        this.create();
    }

    get width() {
        return this.size.get()[0];
    }

    get length() {
        return this.size.get()[1];
    }

    get height() {
        return this.size.get()[2];
    }

    get hitboxRadius() {
        return this.width / 3;
    }

    get z() {
        return this.position.get()[2];
    }

    move(to: Coordinates) {
        this.position.set(to);
    }

    place(appendTo: HTMLElement): this {
        appendTo.appendChild(this.element);
        return this;
    }

    private onPositionChange([x, y, z]: Coordinates) {
        const s = this.element.style;
        s.setProperty('--x', `${x}px`);
        s.setProperty('--y', `${y}px`);
        s.setProperty('--z', `${z}px`);
    }
}