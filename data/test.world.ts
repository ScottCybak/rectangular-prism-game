import { OBJECT_TYPE } from "object-type";
import { WorldData } from "world-data";

export const testWorld: WorldData = {
    id: 'test',
    width: 10000,
    length: 10000,
    spawn: [5000, 5000, 0], // center of the map, on the ground
    perspective: 600,
    speed: [5, 15],
    playerRadius: 10,
    zoom: [-300, 400],
    objects: [
        { // test 1, a basic cube, on the ground
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 5000, 0],
            rotate: [0, 0, 45],
            style: {
                // front: red; // leave so we can see the void 'back'
                back: 'background: #000000ff',
                right: 'background: #0004ffff',
                left: 'background: #ae00ffff',
                top: 'background: #00ffbfff',
                bottom: 'background: #eeff00ff',
            }
        },
        {  // b2: basic cube on the ground, but further to the edge ()
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 200],
            position: [5200, 5000, 0],
            style: {
                front: 'background: center/80% url(img/gravel.jpg);',
                left: 'background: url(img/skyscraper_a.jpg);',
                right: 'background: url(img/skyscraper_a.jpg);',
                top: 'background: url(img/skyscraper_a.jpg);',
                bottom: 'background: url(img/skyscraper_a.jpg);',
            }
        },
        {  // tiny one, right up next b2
            type: OBJECT_TYPE.CUBOID,
            size: [15, 15, 200],
            position: [5185, 5000, 0],
            style: {
                left: 'background: 50% url(img/duct.jpg);',
                top: 'background: 50% url(img/duct.jpg);',
                bottom: 'background: 50% url(img/duct.jpg);'
            }
        },
        { // lets simulate the top of an elevator shaft on b2
            type: OBJECT_TYPE.CUBOID,
            size: [35, 15, 15],
            position: [5185, 5000, 200],
            style: {
                front: 'background: 50% url(img/duct.jpg);',
                top: 'background: 50% url(img/duct.jpg);',
                left: 'background: 50% url(img/duct.jpg);',
                bottom: 'background: 50% url(img/duct.jpg);',
            }
        },
        { // one at the far right
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5650, 5000, 0],
        },
        { // on on the far left
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [4250, 5000, 0],
        },
        { // try one UP
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 4700, 0],
        },
        {  // try one down
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5000, 5200, 0],
        }
    ],
};