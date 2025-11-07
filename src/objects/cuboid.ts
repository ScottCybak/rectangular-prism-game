import { Coordinates } from "coordinates";
import { ObjectBase, ObjectBaseModel } from "object-base";
import { OBJECT_TYPE } from "object-type";

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
// https://codepen.io/desandro/pen/bMqZmr (sample/helper)
export class CuboidObject extends ObjectBase<CuboidObjectModel> {
    create() {
        const { data } = this;
        const { size, style } = data;
        const [x, y, z] = size;
        const halfX = x / 2;
        let doStyle = false;
        // if (this.limits.left > 5600) {
        //     doStyle = true;
        //     console.log('style me..', this);
        // }
        this.stylesheet.replaceSync(`
            .c {
                width: ${x}px;
                height: ${y}px;
                position: relative;
                transform-style: preserve-3d;
                transform: translateZ(-${halfX}px);
            }
            .f {
                position: absolute;
                width: ${x}px;
                height: ${y}px;
                border: 1px solid #fff;
                transition: all 1s linear;
            }
            .f-f {
                transform: rotateY(0deg) translateZ(${halfX}px);
            }
            .f-r {
                transform: rotateY(90deg) translateZ(${halfX}px);
            }
            .f-l {
                transform: rotateY(-90deg) translateZ(${halfX}px);
            }
            .f-t {
                transform: rotateX( 90deg) translateZ(${halfX}px);
            }
            .f-b {
                transform: rotateX(-90deg) translateZ(${halfX}px);
            }
            .f-u {
                transform: rotateY(180deg) translateZ(${halfX}px);
            }
        `);

        const outer = document.createElement('div');
        outer.classList.add('c');
        outer.innerHTML = `
            <div class="f f-f" style="${style?.front}"></div>
            <div class="f f-l"></div>
            <div class="f f-r"></div>
            <div class="f f-t"></div>
            <div class="f f-b"></div>
            <div class="f f-u"></div>
        `;
    
        this.shadow.appendChild(outer);

        return this;
    }
}