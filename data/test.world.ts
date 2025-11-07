import { OBJECT_TYPE } from "object-type";
import { WorldData } from "world-data";

export const testWorld: WorldData = {
    id: 'test',
    width: 10000,
    length: 10000,
    spawn: [4990, 4990], // center of the map, on the ground
    objects: [
        {
            // test 1, a basic cube, on the ground
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 5000, 0],
            style: {
                front: 'background: #f5b40070;'
            }
        },

        {
            // test 2, another basic cube on the ground, but further to the edge
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5200, 5000, 0],
        },

        {
            // one at the far right
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5650, 5000, 0],
            style: {
                front: '',
            }
        },

        {
            // on on the far left
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [4250, 5000, 0],
            style: {
                front: 'background: orange;',
                left: 'background: pink;',
            }
        },

        {
            // try one UP
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 4700, 0],
        },

        {
            // try one down
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 5200, 0],
        }
    ],
};