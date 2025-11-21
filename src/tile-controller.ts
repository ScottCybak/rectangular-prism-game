// tiles 

import { createDiv } from "create-div";
import { debounce } from "debounce";
import { debugLogger } from "debug-logger";
import { ObjectBase, ObjectBaseModel } from "objects/object-base";
import { ReadonlyWatched, Watched } from "watched";
import { World } from "world";

type XY = [number, number];

// when the world is generated, 
export class TileController {

    private tileSize = 512;
    private tileElement = createDiv('tile');
    private resolution = new Watched<XY>([innerWidth, innerHeight]); // this holds our screen resolution:tile
    private adjustedRange!: ReadonlyWatched<XY>; // this holds our scaled/zoom:tile
    private activeTile = new Watched<XY>([0, 0]);
    private buckets = new Map<string, {
        objects: ObjectBase<ObjectBaseModel>[],
        col: number,
        row: number,
    }>(); // holds tileId -> objects[] - an object can exist in multiple

    constructor(private world: World) { }

    init(tileSize: number) {
        const { world } = this;
        this.tileSize = tileSize;

        world.adjustedCurrentPosition.watch(pos => {
            if (!pos) return [0,0];
            const size = this.tileSize;
            const current = this.activeTile.get();
            const next: XY = [Math.floor(pos[0] / size), Math.floor(pos[1] / size)];
            if (next[0] !== current[0] || next[1] !== current[1]) {
                this.activeTile.set(next);
            }
        });

        this.adjustedRange = Watched.combine(
            this.resolution,
            world.zoom.translateZ,
        ).derive(([[w, h], zoom]) => {
            const perspective = world.game?.perspective.get();
            if (!perspective) return [0, 0];
            const scale = perspective / (perspective - zoom);
            const tileSize = this.tileSize * scale;
            return [
                Math.ceil(w / tileSize),
                Math.ceil(h / tileSize),
            ];
        });

        debugLogger.watch(this.adjustedRange, 'tile.range');

        addEventListener('resize', debounce(() => this.resolution.set([innerWidth, innerHeight]), 100));
        
        this.tileElement.classList.add(debugLogger.cssClass);
        this.world.element.insertBefore(this.tileElement, this.world.element.firstChild);
        debugLogger.watch(this.resolution, 'resolution');
        debugLogger.watch(this.activeTile, 'tile.active');

        Watched.combine(
            this.activeTile,
            this.adjustedRange,
        ).watch(([[col, row]]) => {
            const { inRange, notInRange} = this.areObjectsInRange(col, row);
            notInRange.forEach(o => o.offscreen?.set(true));
            inRange.forEach(o => o.offscreen?.set(false));
        })

        this.world.worldSize.watch(s => this.onWorldSizeChange(s));
    }

    get loadedObjects(): ObjectBase<any>[] {
        const [col, row] = this.activeTile.get();
        const id = this.makeTileId(col, row);
        return this.buckets.get(id)?.objects ?? [];
    }

    add(obj: ObjectBase<ObjectBaseModel>) {
        const { left, top, width, height } = obj;
        const t = this.tileSize;
        const startCol = Math.floor(left / t);
        const startRow = Math.floor(top / t);
        const endCol = Math.floor((left + width) / t);
        const endRow = Math.floor((top + height) / t);
        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                this.addToBucket(obj, c, r, this.makeTileId(c, r));
            }
        }
        obj.place(this.world.element);
    }

    private areObjectsInRange(col: number, row: number) {
        const [x, y] = this.adjustedRange.get(); // x = 4, y = 1
        const halfX = x / 2;
        const halfY = y / 2;
        const minX = col - halfX;
        const maxX = col + halfX;
        const minY = row - Math.max(halfY, 1);
        const maxY = row + halfY;
        const inRange = new Set<ObjectBase<ObjectBaseModel>>();
        const notInRange = new Set<ObjectBase<ObjectBaseModel>>();
        this.buckets
            .entries()
            .forEach(([id, {objects, row, col }]) => {
                if (col >= minX && col <= maxX && row >= minY && row <= maxY) {
                    objects.forEach(o => inRange.add(o));
                } else {
                    objects.forEach(o => {
                        if (!inRange.has(o)) {
                            notInRange.add(o);
                        }
                    })
                }
            });
        return {
            inRange,
            notInRange,
        }
    }

    private addToBucket(obj: ObjectBase<ObjectBaseModel>, col: number, row: number, index: string) {
        const b = this.buckets;
        if (!b.has(index)) {
            b.set(index, {
                objects: [obj],
                col,
                row,
            });
        } else {
            b.get(index)?.objects.push(obj);
        }
    }

    onWorldSizeChange([width, height]: XY) {

    }

    private makeTileId(col: number, row: number) {
        return `${col}-${row}`;
    }
}