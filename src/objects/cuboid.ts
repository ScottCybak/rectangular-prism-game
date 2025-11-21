import { Coordinates } from "coordinates";
import { degreeToRadian } from "degree-to-radian";
import { ObjectBase, ObjectBaseModel } from "objects/object-base";
import { OBJECT_TYPE } from "objects/object-type";
import { segmentAABBDistanceSquared } from "segment-aabb-distance-squared";
import { worldToLocal } from "world-to-local";

interface PrecomputedCuboid {
    center: Coordinates;
    halfSize: Coordinates;
    inverseRotationMatrix: number[][];
}

export interface CuboidObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.CUBOID;
    style?: {
        front?: string;
        back?: string;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
    }
}

export class CuboidObject extends ObjectBase<CuboidObjectModel> {

    private precomputedCuboid!: PrecomputedCuboid;

    containsPoint(playerPos: Coordinates): boolean {
        const { center, inverseRotationMatrix, halfSize } = this.precomputedCuboid
        const [px, py] = playerPos;
        const [cx, cy] = center;
        const dx = px - cx;
        const dy = py - cy;
        const m = inverseRotationMatrix;
        const localX = m[0][0] * dx + m[0][1] * dy;
        const localY = m[1][0] * dx + m[1][1] * dy;
        const [hx, hy] = halfSize;
        return Math.abs(localX) <= hx && Math.abs(localY) <= hy;
    }

    hideByCoordinates(point: Coordinates) {
        const match = this.containsPoint(point);
        this.toggleVisibility(match);
        return match;
    }

    toggleVisibility(visible: boolean): void {
        this.isHidden.set(visible);
    }

    create() {
        const { element, data } = this;
        const { style } = data;
        const common = `position: absolute; transform-origin: left top;`;
        element.innerHTML = `
            <!-- front -->
            <div style="${common}
                width: var(--w);
                height: var(--l);
                transform: translateZ(var(--h));
                ${style?.front ?? ''}
            "></div>

            <!-- back -->
            <div style="${common}
                width: var(--w);
                height: var(--l);
                ${style?.back ?? ''}
            "></div>
            
            <!-- left -->
            <div style="${common}
                width: var(--h);
                height: var(--l);
                transform: rotateY(-90deg);
                ${style?.left ?? ''}
            "></div>

            <!-- right -->
            <div style="${common}
                width: var(--h);
                height: var(--l);
                transform: rotateY(90deg) translate3d(var(--neg-d), 0, var(--w));
                ${style?.right ?? ''}
            "></div>

            <!-- top -->
            <div style="${common}
                width: var(--w);
                height: var(--h);
                transform: rotateX(90deg);
                ${style?.top ?? ''}
            "></div>

            <!-- bottom -->
            <div style="${common}
                height: var(--h);
                width: var(--w);
                transform: rotateX(-90deg) translate3d(0, var(--neg-d), var(--l));
                ${style?.bottom ?? ''}
            "></div>
        `;
        this.precomputeCuboid(data);

        return this;
    }

    precomputeCuboid(cuboid: CuboidObjectModel): void {
        const [rx, ry, rz] = (cuboid.rotate ?? [0, 0, 0]).map(degreeToRadian);

        const cx = Math.cos(rx), sx = Math.sin(rx);
        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cz = Math.cos(rz), sz = Math.sin(rz);
        const position = cuboid.position ?? [0,0,0];
        const size = cuboid.size ?? [0,0,0];

        const rot = [
            [cy * cz, cz * sx * sy - cx * sz, sx * sz + cx * cz * sy],
            [cy * sz, cx * cz + sx * sy * sz, cx * sy * sz - cz * sx],
            [-sy,     cy * sx,                cx * cy],
        ];

        const inverseRotationMatrix = [
            [rot[0][0], rot[1][0], rot[2][0]],
            [rot[0][1], rot[1][1], rot[2][1]],
            [rot[0][2], rot[1][2], rot[2][2]],
        ];

        const halfSize = size.map(s => s / 2) as Coordinates;

        const center: Coordinates = [
            position[0] + size[0] / 2,
            position[1] + size[1] / 2,
            position[2] + size[2] / 2,
        ];

        this.precomputedCuboid = { center, halfSize, inverseRotationMatrix };
    }
}
