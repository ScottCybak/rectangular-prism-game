import { Camera } from "camera";
import { COMMAND } from "command";
import { Coordinates, isCoordinates } from "coordinates";
import { createDiv } from "create-div";
import { debugLogger } from "debug-logger";
import { Game } from "game";
import { CommandSet } from "input";
import { MinMax } from "min-max";
import { objectClasses, ObjectModel } from "objects/object-classes";
import { objectMap } from "objects/object-map";
import { OBJECT_TYPE } from "objects/object-type";
import { CuboidObject, CuboidObjectModel } from "objects/cuboid";
import { TileController } from "tile-controller";
import { ReadonlyWatched, Watched } from "watched";
import { WorldData } from "world-data";
import { Zoom } from "zoom";
import { CreatureBase } from "creatures/creature-base";
import { creatureClasses, CreatureModel } from "creatures/creature-classes";

export class World {
    static id = 'world';

    currentPosition = new Watched<Coordinates | undefined>(undefined);
    position = this.currentPosition.asReadonly();

    private worldData = new Watched<WorldData | undefined>(undefined);
    worldSize: ReadonlyWatched<[number, number]> = this.worldData.derive(d => d ? [d.width, d.length] : [0, 0]);
    camera = new Camera(this);
    zoom = new Zoom(this);
    element = createDiv(World.id);
    avatar!: Watched<CreatureBase<any>>;
    avatarPosition!: ReadonlyWatched<Coordinates>;

    // these should probably get revisisted to be more responsive?
    private speed: MinMax = [1,2];
    playerRadius = 0;
    verticalStep!: number;
    
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
        const avatar = this.createCreature({ ...data.avatar, isPlayer: true}).place(element);
        this.speed = [...data.speed];
        this.playerRadius = data.playerRadius;
        this.verticalStep = data.verticalStep;
        this.avatar = new Watched(avatar);

        this.avatarPosition = Watched.combine(
            this.adjustedCurrentPosition,
            this.avatar,
        ).derive(([pos, creature]) => {
            if (!pos || !creature) return [0,0,0];
            return [
                pos[0] - creature.width / 2,
                pos[1] - creature.length / 2,
                pos[2] + creature.height / 2,
            ]
        });

        // initialize our tiling agent
        this.tileController.init(data.tileSize);
        
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

        // spin up our player
        this.initialPlayerSpawn(data.spawn);

        // simulate a delay
        // await new Promise(f => setTimeout(f, 1000));
        this.adjustedCurrentPosition.watch(pos => {
            if (pos) {
                this.tileController.loadedObjects.forEach(o => o.hideByCoordinates(pos))
            }
        })

        // i don't think this is doing what it needs to..
        // if a command is updated mid tick, it will run
        // in between ticks?
        Watched.combine(this.game.tick, this.game.commands)
            .conditional(([t, c]) => !!(t && c.size))
            .derive(([_, c]) => {
                this.doCommands(c)
            });

        // and, notify that we're good to go
        this.ready.set(true);
    }

    doCommands(commands: CommandSet) {
        const [minSpeed, maxSpeed] = this.speed;
        let x = 0;
        let y = 0;
        let z = 0;
        const multiplier = commands.has(COMMAND.SPRINT) ? maxSpeed : minSpeed; // reverse for hold to walk mechanic
        if (commands.has(COMMAND.MOVE_LEFT)) x = x - 1 * multiplier;
        if (commands.has(COMMAND.MOVE_DOWN)) y = y + 1 * multiplier;
        if (commands.has(COMMAND.MOVE_RIGHT)) x = x + 1 * multiplier;
        if (commands.has(COMMAND.MOVE_UP)) y = y - 1 * multiplier;
        if (x || y) {
            const pos = this.currentPosition.get();
            if (pos) {
                const [l, t, z] = pos;
                const targetPos: Coordinates = [
                    l-x,
                    t-y,
                    z,
                ]; // todo - update if we implement Z axis changes
                console.log('check', targetPos);
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
        // try {
        //     const rawPosition = sessionStorage.getItem(storageKey);
        //     if (rawPosition) {
        //         const pos = JSON.parse(rawPosition);
        //         if (isCoordinates(pos)) {
        //             startPosition = pos;
        //             // check to make sure it's in the worlds range...
        //         } else {
        //             console.warn('stored value isnt a valid coordinate', pos);
        //         }
        //     }
        // } catch (err) {
        //     console.warn('bad stored position', err);
        // }
        // this.centerPositionOn(startPosition ?? spawn);
        this.currentPosition.set(startPosition ?? spawn);

        // generate a box/character for now
        // const avatarModel: CuboidObjectModel = {
        //     type: OBJECT_TYPE.CUBOID,
        //     label: 'avatar',
        //     size: this.avatar.get(),
        // };
        // const avatar = new CuboidObject(avatarModel, this).create().place(this.element);
        this.avatarPosition.watch(pos => this.avatar.get()?.move(pos));

        // setup our position->storage item
        this.currentPosition.watch(pos => {
            if (pos) sessionStorage.setItem(storageKey, JSON.stringify(pos));
        });
    }

    private canMove(to: Coordinates): false | Coordinates {
        const data = this.worldData.get();
        if (data) {
            const [x, y] = to;
            const adjusted = this.adjustPosition(to, data);
            const avatar = this.avatar.get();
            const { hitboxRadius, z } = avatar;
            const intersections = this.tileController.loadedObjects.filter(o => o.doesPointIntersect(adjusted, hitboxRadius, z));
            if (intersections.length) {
                const match = intersections.map(o => o.canMoveOnto(adjusted, hitboxRadius, z)).find(o => !!o);
                if (match) {
                    return [x, y, match[2]];
                }
                return false;
            } else {
                const fallTo = this.canFall(to, hitboxRadius);
                if (fallTo && fallTo[2] !== to[2]) {
                    return fallTo;
                }
            }
            return [to[0], to[1], to[2]];
        }
        return false;
    }

    private canFall(point: Coordinates, radius: number): false | Coordinates {
        // we need to translat the point to viewport percentage
        const camera = this.camera.cameraPosition.get();
        const x = (point[0] - camera.x) + innerWidth / 2;
        const y = (point[1] - camera.y) + innerHeight / 2;
        const r = this.avatar.get().hitboxRadius;
        // this only works on the center point, we need to grab our edge points also
        const matches = [
            ...new Set(([
                [x, y],
                [x - r, y],
                [x + r, y],
                [x, r - y],
                [x, r + y]
            ] as [number, number][])
                .map(([x, y]) => (document.elementsFromPoint(x, y) as HTMLElement[]))
                .flat()
                .map(e => e?.closest('.object') as HTMLElement)
                .filter(e => e && !e.closest('.creature'))
                .map(e => objectMap.get(e))
                .filter(o => !!o)
            )
        ];
        if (matches.length === 1) {
            const { base, depth } = matches[0];
            return [point[0], point[1], base + depth];
        }
        return false;
    }


    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                new Klass(o, this).create().addToTile(this.tileController);

            } else {
                console.warn('no class found', o);
            }
        })
    }

    private createCreature(creature: CreatureModel) {
        const Klass = creatureClasses[creature.type];
        if (Klass) {
            return new Klass(creature, this);
        } else {
            console.warn('no creature class found', creature);
            throw 'invalid create class';
        }
    }

    private adjustPosition(pos: Coordinates, { width, length }: WorldData): Coordinates {
        return [
            (width / 2) - pos[0],
            (length / 2) - pos[1],
            pos[2],
        ];
    }
}