import { Coordinates } from "coordinates";
import { createDiv } from "create-div";
import { debugLogger } from "debug-logger";
import { Watched } from "watched";
import { World } from "world";

export class Camera {

    static id = 'camera';
    static xCssVar = '--c-x';
    static yCssVar = '--c-y';
    static transitionSpeedMs = 150;

    cameraPosition = new Watched({x: 0, y: 0});

    element = createDiv(Camera.id);

    constructor(private world: World) {
        const s = this.element.style;
        s.cssText = `
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transform: translate3d(var(${Camera.xCssVar}), var(${Camera.yCssVar}), 0);
            transition: transform ${Camera.transitionSpeedMs}ms ease-out;
        `;

        world.position.watch(c => this.onPositionChange(c));
        debugLogger.watch(world.position, 'position');

        this.cameraPosition.watch(({x, y}) => {
            s.setProperty(Camera.xCssVar, `${x ?? 0}px`);
            s.setProperty(Camera.yCssVar, `${y ?? 0}px`);
        })
    }

    appendTo(element?: HTMLElement) {
        element?.appendChild(this.element);
    }

    private onPositionChange(pos?: Coordinates) {
        if (pos) {
            const [x, y] = pos;
            const s = this.world?.game?.element?.style;
            if (!s) {
                console.warn('ignored');
                return;
            }
            this.cameraPosition.set({ x, y });
        }
    }

}