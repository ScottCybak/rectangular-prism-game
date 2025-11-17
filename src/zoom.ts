import { Camera } from "camera";
import { createDiv } from "create-div";
import { debounce } from "debounce";
import { debugLogger } from "debug-logger";
import { MinMax } from "min-max";
import { Watched } from "watched";
import { World } from "world";

export class Zoom {
    static id = 'zoom';
    static cssVar = '--zoom';
    static zoomSteps = 25;
    static transitionSpeedMs = Camera.transitionSpeedMs * 2;

    private min = 0;
    private max = 0;
    private zoomTimeout!: number;

    translateZ = new Watched(0);

    element = createDiv(Zoom.id);

    constructor(private world: World) {
        this.element.style.cssText = `
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transform: translateZ(var(--zoom, 0));
            transition: transform ${Zoom.transitionSpeedMs}ms ease-out;as
        `;
        // ddEventListener('resize', debounce(() => this.resolution.set([innerWidth, innerHeight]), 100));
        this.translateZ.watch(debounce(this.onZoomChange.bind(this), 10));
        // this.translateZ.watch(z => this.onZoomChange(z));
        debugLogger.watch(this.translateZ, 'translateZ');
    }

    set constraints([min, max]: MinMax) {
        this.min = min;
        this.max = max;
        let value = this.translateZ.get();
        if (value < min) {
            this.translateZ.set(min);
        } else if (value > max) {
            this.translateZ.set(max);
        }
    }

    in() {
        // gets a bit goofy in here, due to us using translate
        const current = this.translateZ.get();
        const next = current + Zoom.zoomSteps;
        if (next <= Math.abs(this.min)) {
            this.translateZ.set(next);
        }
    }

    out() {
        const current = this.translateZ.get();
        const next = current - Zoom.zoomSteps;
        if (Math.abs(next) <= this.max) {
            this.translateZ.set(next);
        }
    }

    // this is crude, but it may work...
    private onZoomChange(zoom: number) {
        requestAnimationFrame(() => {
            this.world?.game?.element?.style.setProperty(Zoom.cssVar, `${zoom ?? 0}px`);
        });
    }

    appendTo(element?: HTMLElement) {
        element?.appendChild(this.element);
    }
}