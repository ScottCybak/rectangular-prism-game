import { Coordinates } from "coordinates";
import { createDiv } from "create-div";
import { ObjectBase, ObjectBaseModel } from "objects/object-base";
import { OBJECT_TYPE } from "objects/object-type";

export interface FloorObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.FLOOR,
    style: string;
}

export class FloorObject extends ObjectBase<FloorObjectModel> {
    create(): this {
        // this is a simple 2d text
        const e = createDiv();
        e.style.cssText = ` width: 100%; height: 100%; ${this.data.style ?? ''}`
        this.element.appendChild(e);
        return this;
    }

    // force it false
    doesPointIntersect(position: Coordinates, radius: number): boolean {
        // return true if position is >= z position
        // const { left, width, top, height, base, depth } = this;
        // const [x, y, z] = position;
        return false;
        // return z >= base + depth
        //     && x >= left && x <= left + width
        //     && y >= top && y <= top + height;
    }

    hideByCoordinates([x, y, z]: Coordinates): boolean {
        const { depth, base } = this;
        return z < depth + base;
    }

    canMoveOnto([x, y, z]: Coordinates, radius: number, height: number): false | Coordinates {
        // we assume this this does intersect
        // console.log('assume intersection is true, or we are above it');
        // return false;/
        return [x, y, this.base + this.depth];
        // return [x, y, z];
        // throw new Error("Method not implemented.");
    }

}