import { COMMAND } from "command";
import { Coordinates } from "coordinates";
import { debugLogger } from "debug-logger";
import { Game } from "game";
import { CommandSet } from "input";
import { MinMax } from "min-max";
import { ObjectBase, XY } from "object-base";
import { objectClasses, ObjectModel } from "object-classes";
import { Watched } from "watched";
import { WorldData } from "world-data";

export class World {

    private domId = 'world';

    private loadedObjects: ObjectBase<any>[] = [];

    private element = document.createElement('div');

    private currentPosition = new Watched<Coordinates>([-1000, -1000, -1000]);

    private scrollPosition = this.currentPosition.derive<XY>(current => {
        return [current[0] - window.innerWidth / 2, current[1] - window.innerHeight / 2]
    });

    private speed: MinMax = [1,2];
    private playerRadius = 0;

    constructor(
        private game: Game,
    ) {
        debugLogger.watch(this.currentPosition, 'currentPosition');
        debugLogger.watch(this.scrollPosition, 'scrollPosition');
        this.currentPosition.watch(pos => this.onPositionUpdate(pos));
        this.scrollPosition.watch(pos => this.scrollTo(pos));
    }

    ready = new Watched(false);

    async loadData(data: WorldData) {
        this.ready.set(false);

        const { width, length, perspective } = data;
        const { domId, element } = this;
        this.speed = [...data.speed];
        this.playerRadius = data.playerRadius;
        
        element.id = domId;
        element.style.cssText = `
            width: ${width}px;
            height: ${length}px;
            position: absolute;
            top: 0;
            left: 0;
            --p: ${perspective}px;
        `;

        if (data.objects?.length) {
            this.createObjects(data.objects, element);
        }

        // ok, connect to the page finally, since the heavy lifting is done
        this.game.element?.appendChild(element);

        // set our spawn position
        this.currentPosition.set(data.spawn);

        // simulate a delay
        // await new Promise(f => setTimeout(f, 1000));

        Watched.combine(this.game.tick, this.game.commands)
            .conditional(([t, c]) => !!(t && c.size))
            .derive(([_, c]) => this.doCommands(c));

        // and, notify that we're good to go
        this.ready.set(true);
    }

    doCommands(commands: CommandSet) {
        const [minSpeed, maxSpeed] = this.speed;
        let x = 0;
        let y = 0;
        const multiplier = commands.has(COMMAND.SPRINT) ? maxSpeed : minSpeed; // reverse for hold to walk mechanic
        if (commands.has(COMMAND.MOVE_LEFT)) x = x - 1 * multiplier;
        if (commands.has(COMMAND.MOVE_DOWN)) y = y + 1 * multiplier;
        if (commands.has(COMMAND.MOVE_RIGHT)) x = x + 1 * multiplier;
        if (commands.has(COMMAND.MOVE_UP)) y = y - 1 * multiplier;
        if (x || y) {
            const [l, t] = this.currentPosition.get();
            const targetPos: Coordinates = [l+x, t+y, 0]; // todo - update if we implement Z axis changes
            const candidatePos = this.canMove(targetPos);
            if (candidatePos) {
                this.currentPosition.set(candidatePos);
            }
        }
    }

    private canMove(to: Coordinates): false | Coordinates {
        const intersections = this.loadedObjects.filter(o => o.doesPointIntersect(to, this.playerRadius));
        if (intersections.length) {
            // todo; this should be smarter - if moving sw against a flat NS oriented plane, we should continue south
            return false;
        }
        return to;
    }

    private scrollTo([left, top]: XY, behavior: ScrollBehavior = 'instant') {
        this.game.element?.scrollTo({left, top, behavior});
    }


    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        const { loadedObjects } = this;
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                const instance = new Klass(o).create().place(container);
                loadedObjects.push(instance);

            } else {
                console.warn('no class found', o);
            }
        })
    }

    private onPositionUpdateTick = false;
    private onPositionUpdate([left, top]: Coordinates) {
        if (!this.onPositionUpdateTick) {
            requestAnimationFrame(() => {
                const { scrollWidth, scrollHeight } = this.element;
                const x = left / scrollWidth * 100;
                const y = top / scrollHeight * 100;
                this.element.style.perspectiveOrigin = `${x}% ${y}%`;
                this.onPositionUpdateTick = false;
            });
            this.onPositionUpdateTick = true;
        }
    }
}