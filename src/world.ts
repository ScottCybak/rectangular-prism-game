import { Camera } from "camera";
import { COMMAND } from "command";
import { Coordinates, isCoordinates } from "coordinates";
import { createDiv } from "create-div";
import { debugLogger } from "debug-logger";
import { Game } from "game";
import { CommandSet } from "input";
import { MinMax } from "min-max";
import { ObjectBase } from "object-base";
import { objectClasses, ObjectModel } from "object-classes";
import { TileController } from "tile-controller";
import { ReadonlyWatched, Watched } from "watched";
import { WorldData } from "world-data";
import { Zoom } from "zoom";

export class World {
    static id = 'world';

    currentPosition = new Watched<Coordinates | undefined>(undefined);
    position = this.currentPosition.asReadonly();

    private worldData = new Watched<WorldData | undefined>(undefined);
    worldSize: ReadonlyWatched<[number, number]> = this.worldData.derive(d => d ? [d.width, d.length] : [0, 0]);
    camera = new Camera(this);
    zoom = new Zoom(this);
    element = createDiv(World.id);

    // these should probably get revisisted to be more responsive?
    private speed: MinMax = [1,2];
    private playerRadius = 0;

    adjustedCurrentPosition = Watched
        .combine(this.currentPosition, this.worldData)
        .conditional(([pos, data]) => !!(pos && data))
        .derive(([pos, data]) => {
            if (!pos || !data) return undefined;
            return this.adjustPosition(pos, data);
        })
        .conditional(pos => !!pos);

    tileController!: TileController;

    constructor(
        public game: Game,
    ) {
        console.log('world constructor', game);
        this.worldData.watch(d => {
            if (d?.zoom) this.zoom.constraints = d.zoom;
        });
        debugLogger.watch(this.adjustedCurrentPosition, 'pxPosition');
        this.tileController = new TileController(this);
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

        // initialize our tiling agent
        this.tileController.init();

        // spin up our player
        this.initialPlayerSpawn(data.spawn);

        // simulate a delay
        // await new Promise(f => setTimeout(f, 1000));
        this.adjustedCurrentPosition.watch(pos => {
            if (pos) {
                this.tileController.loadedObjects.forEach(o => o.hideByCoordinates(pos))
            }
        })

        Watched.combine(this.game.tick, this.game.commands)
            .conditional(([t, c]) => !!(t && c.size))
            .derive(([_, c]) => this.doCommands(c));

        // this.createPlayer([data.spawn[0] - 100, data.spawn[1] - 100, 0]);

        // and, notify that we're good to go
        this.ready.set(true);
    }

    // deprecated
    // createPlayer(position: Coordinates) {
    //     const d = sampleSkeleton;
    //     const skellyBoy = new Skeleton(d, position).appendTo(this.element);
    //     console.log('skellyBoy', skellyBoy);
    // }

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

    private initialPlayerSpawn(spawn: Coordinates) {
        const storageKey = 'world.currentPosition';
        // set our spawn position
        let startPosition!: Coordinates;
        try {
            const rawPosition = sessionStorage.getItem(storageKey);
            if (rawPosition) {
                const pos = JSON.parse(rawPosition);
                if (isCoordinates(pos)) {
                    startPosition = pos;
                    // check to make sure it's in the worlds range...
                } else {
                    console.warn('stored value isnt a valid coordinate', pos);
                }
            }
        } catch (err) {
            console.warn('bad stored position', err);
        }
        // this.centerPositionOn(startPosition ?? spawn);
        this.currentPosition.set(startPosition ?? spawn);

        // setup our position->storage item
        this.currentPosition.watch(pos => {
            if (pos) sessionStorage.setItem(storageKey, JSON.stringify(pos));
        });
    }

    private canMove(to: Coordinates): false | Coordinates {
        // we need to the position to our actual game size, as everythin coming in is relative to it's center point
        const data = this.worldData.get();
        if (data) {
            const adjusted = this.adjustPosition(to, data);
            const intersections = this.tileController.loadedObjects.filter(o => o.doesPointIntersect(adjusted, this.playerRadius));
            if (intersections.length) {
                // todo; this should be smarter - if moving sw against a flat NS oriented plane, we should continue south
                return false;
            }
            return to;
        }
        return false;
    }


    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        // const { loadedObjects } = this;
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                new Klass(o).create().addToTile(this.tileController);

            } else {
                console.warn('no class found', o);
            }
        })
    }

    private adjustPosition(pos: Coordinates, { width, length }: WorldData): Coordinates {
        return [
            (width / 2) - pos[0],
            (length / 2) - pos[1],
            pos[2],
        ];
    }
}