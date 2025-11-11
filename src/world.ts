import { Camera } from "camera";
import { COMMAND } from "command";
import { Coordinates } from "coordinates";
import { createDiv } from "create-div";
import { Game } from "game";
import { CommandSet } from "input";
import { MinMax } from "min-max";
import { ObjectBase } from "object-base";
import { objectClasses, ObjectModel } from "object-classes";
import { Watched } from "watched";
import { WorldData } from "world-data";
import { Zoom } from "zoom";

export class World {
    static id = 'world';

    private loadedObjects: ObjectBase<any>[] = [];

    currentPosition = new Watched<Coordinates | undefined>(undefined);
    position = this.currentPosition.asReadonly();

    private worldData = new Watched<WorldData | undefined>(undefined);

    camera = new Camera(this);
    zoom = new Zoom(this);
    element = createDiv(World.id);

    // these should probably get revisisted to be more responsive?
    private speed: MinMax = [1,2];
    private playerRadius = 0;

    constructor(
        public game: Game,
    ) {       
        this.worldData.watch(d => {
            if (d?.zoom) this.zoom.constraints = d.zoom;
        });
    }

    ready = new Watched(false);

    async loadData(data: WorldData) {
        this.ready.set(false);
        this.worldData.set(data);

        const { width, length } = data;
        const { element, camera, game, zoom } = this;
        this.speed = [...data.speed];
        this.playerRadius = data.playerRadius;
        // game.environment.perspective.set(perspective);
        
        element.style.cssText = `
            position: absolute;
            width: ${width}px;
            height: ${length}px;
            top: 50%;
            left: 50%;
            transform-style: preserve-3d;
            transform: translate3d(-50%, -50%, 0);
        `;

        if (data.objects?.length) {
            this.createObjects(data.objects, element);
        }

        // create the heirarchy and inject into dom
        if (game.element) {
            camera.appendTo(game.element);
            zoom.appendTo(camera.element);
            zoom.element.appendChild(element);
            
        } else {
            console.warn('unable to find game element');
        }

        // set our spawn position
        this.centerPositionOn(data.spawn);
        // this.currentPosition.set(data.spawn);

        // simulate a delay
        // await new Promise(f => setTimeout(f, 1000));

        Watched.combine(this.game.tick, this.game.commands)
            .conditional(([t, c]) => !!(t && c.size))
            .derive(([_, c]) => this.doCommands(c));

        // and, notify that we're good to go
        this.ready.set(true);
    }

    centerPositionOn([x, y, z]: Coordinates) {
        const data = this.worldData.get();
        if (data) {
            const { width, length } = data;
            this.currentPosition.set([
                x - (width / 2),
                y - (length / 2),
                z,
            ])
        }
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
            const pos = this.currentPosition.get();
            if (pos) {
                const [l, t] = pos;
                const targetPos: Coordinates = [
                    l-x,
                    t-y,
                    0
                ]; // todo - update if we implement Z axis changes
                const candidatePos = this.canMove(targetPos);
                if (candidatePos) {
                    this.currentPosition.set(candidatePos);
                }
            }
        }
    }

    doAction(command: COMMAND) {
        switch (command) {
            case (COMMAND.ZOOM_IN):
                this.zoom.in();
                break;
            case (COMMAND.ZOOM_OUT):
                this.zoom.out();
                break;
        }
    }

    private canMove(to: Coordinates): false | Coordinates {
        // we need to the position to our actual game size, as everythin coming in is relative to it's center point
        const data = this.worldData.get();
        if (data) {
            const { width, length } = data;
            const adjusted: Coordinates = [
                (width / 2) - to[0],
                (length / 2) - to[1],
                to[2],
            ];
            const intersections = this.loadedObjects.filter(o => o.doesPointIntersect(adjusted, this.playerRadius));
            if (intersections.length) {
                // todo; this should be smarter - if moving sw against a flat NS oriented plane, we should continue south
                return false;
            }
            return to;
        }
        return false;
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
}