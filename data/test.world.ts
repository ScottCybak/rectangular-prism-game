import { OBJECT_TYPE } from "object-type";
import { WorldData } from "world-data";

const makeColorHelper = (color: string) => {
    const colorCss = `background: ${color};`;
    return {
        left: colorCss,
        right: colorCss,
        top: colorCss,
        bottom: colorCss,
        front: colorCss,
        back: colorCss,
    }
}

const helpers = {
    ivory: makeColorHelper('ivory'),
    grey: makeColorHelper('grey'),
}

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
        {  // our weirdly rendered building
            type: OBJECT_TYPE.GROUP,
            size: [0, 0, 0],
            position: [5185, 5000, 0], // items inside a group are relative
            objects: [
                {  // b2: basic cube on the ground, but further to the edge ()
                    type: OBJECT_TYPE.CUBOID,
                    size: [100, 100, 200],
                    position: [15, 0, 0],
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
                    position: [0, 0, 0],
                    style: {
                        left: 'background: 50% url(img/duct.jpg);',
                        top: 'background: 50% url(img/duct.jpg);',
                        bottom: 'background: 50% url(img/duct.jpg);'
                    }
                },
                { // lets simulate the top of an elevator shaft on b2
                    type: OBJECT_TYPE.CUBOID,
                    size: [35, 15, 15],
                    position: [0, 0, 200],
                    style: {
                        front: 'background: 50% url(img/duct.jpg);',
                        top: 'background: 50% url(img/duct.jpg);',
                        left: 'background: 50% url(img/duct.jpg);',
                        bottom: 'background: 50% url(img/duct.jpg);',
                    }
                },
            ]
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
        {  // fancy skyscraper b
            type: OBJECT_TYPE.GROUP,
            size: [0, 0, 0],
            position: [5000, 5200, 0],
            objects: [
                {  // corner column TL
                    type: OBJECT_TYPE.CUBOID,
                    size: [30, 30, 175],
                    position: [0, 0, 0],
                    style: {
                        ...helpers.ivory,
                        front: 'background: grey;'
                    },
                },
                { // corner column TR
                    type: OBJECT_TYPE.CUBOID,
                    size: [30, 30, 175],
                    position: [200, 0, 0],
                    style: {
                        ...helpers.ivory,
                        front: 'background: grey;'
                    },
                },
                { // corner column BL
                    type: OBJECT_TYPE.CUBOID,
                    size: [30, 30, 175],
                    position: [0, 150, 0],
                    style: {
                        ...helpers.ivory,
                        front: 'background: grey;'
                    },
                },
                { // corner column BR
                    type: OBJECT_TYPE.CUBOID,
                    size: [30, 30, 175],
                    position: [200, 150, 0],
                    style: {
                        ...helpers.ivory,
                        front: 'background: grey;'
                    },
                },
                {  // 1st floor (draw order is important here, for clipping.. maybe?)
                    type: OBJECT_TYPE.CUBOID,
                    size: [200, 150, 150],
                    position: [15, 15, 0],
                    style: {
                        ...helpers.grey
                    },
                },
                { // lets try nesting .. .again
                    type: OBJECT_TYPE.GROUP,
                    size: [0, 0, 0],
                    position: [15, 15, 150],
                    objects: [
                        { // west
                            type: OBJECT_TYPE.CUBOID,
                            size: [5, 140, 15],
                            position: [5, 5, 0],
                            style: helpers.ivory, // what happens?
                        },
                        { // east
                            type: OBJECT_TYPE.CUBOID,
                            size: [5, 140, 15],
                            position: [190, 5, 0],
                            style: helpers.ivory,
                        },
                        { // north
                            type: OBJECT_TYPE.CUBOID,
                            size: [180, 5, 15],
                            position: [10, 5, 0],
                            style: helpers.ivory,
                        },
                        { // south
                            type: OBJECT_TYPE.CUBOID,
                            size: [180, 5, 15],
                            position: [10, 140, 0],
                            style: helpers.ivory,
                        },
                    ],
                },

                {
                    // 2nd floor main
                    type: OBJECT_TYPE.GROUP,
                    size: [0, 0, 0], //[150, 100, 150],
                    position: [40, 40, 150],
                    objects: [
                        {
                            type: OBJECT_TYPE.CUBOID,
                            size: [150, 100, 25],
                            position: [0, 0, 0],
                            style: helpers.ivory,
                        },
                        {
                            type: OBJECT_TYPE.CUBOID,
                            size: [120, 70, 125],
                            position: [15, 15, 25],
                            style: helpers.grey,
                        },
                    ],
                },
                {
                    // 3rd floor
                    type: OBJECT_TYPE.GROUP,
                    size: [100, 50, 25],
                    position: [65, 65, 300],
                    objects: [
                        {
                            type: OBJECT_TYPE.CUBOID,
                            size: [100, 50, 25],
                            position: [0, 0, 0],
                            style: helpers.ivory,
                        },
                        {
                            type: OBJECT_TYPE.CUBOID,
                            size: [5, 5, 125],
                            position: [47.5, 22.5, 25],
                            style: helpers.grey,
                        }
                    ]
                }
            ]
        }
    ],
};