import { OBJECT_TYPE } from "objects/object-type";
import { CuboidObjectModel } from "objects/cuboid";
import { WorldData } from "world-data";
import { CREATURE_TYPE } from "creatures/creature-type";

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
    glass: makeColorHelper('rgba(255, 255, 255, 0.31)'),
    brown: makeColorHelper('brown'),
    green: makeColorHelper('green'),
    treeCanopy: makeColorHelper('rgba(45, 143, 0, 0.39)'),
    plaster: makeColorHelper('#e0ccba'),
    concrete: makeColorHelper('#D2D1CD'),
}

const cHeight = 96;
const doorHeight = 80;
const doorHeaderHeight = cHeight - doorHeight;
const makeWall = (x: number, y: number, z = cHeight, style = helpers.plaster): CuboidObjectModel => {
    return {
        type: OBJECT_TYPE.CUBOID,
        size: [x, y, z],
        style,
    }
}

export const testWorld: WorldData = {
    id: 'test',
    width: 12000,
    length: 10000,
    spawn: [1340, 340, 0], // center of the map, on the ground
    perspective: 1000,
    speed: [4, 10],
    playerRadius: 10,
    avatar: {
        type: CREATURE_TYPE.HUMANOID,
        size: [22, 13, 76],
        position: [0, 0, 0],
    },
    zoom: [-400, 400],
    tileSize: 256,
    verticalStep: 8,
    objects: [
        { // base
            type: OBJECT_TYPE.FLOOR,
            size: [12000, 10000, 0],
            style: 'background: #348C31 ;'
        },
        { // house
            type: OBJECT_TYPE.GROUP,
            label: 'house',
            position: [4500,4500, 0],
            objects: [
                { // patio
                    type: OBJECT_TYPE.GROUP,
                    label: 'patio',
                    position: [0, 47.5, 0],
                    objects: [
                        { // foundation
                            type: OBJECT_TYPE.CUBOID,
                            size: [98, 202.5, 15.5],
                            style: helpers.concrete,
                            label: 'patio-foundation',
                        },
                        { // porch
                            type: OBJECT_TYPE.CUBOID,
                            size: [59.5, 43, 15.5],
                            position: [98-59.5, 202.5, 0],
                            style: helpers.concrete,
                            label: 'porch-foundation',
                        },
                        {
                            type: OBJECT_TYPE.CUBOID,
                            size: [59.5, 10, 7.75],
                            position: [98-59.5, 202.5+43, 0],
                            style: helpers.concrete,
                            label: 'porch-stair',
                        },
                        { // N wall
                            type: OBJECT_TYPE.GROUP,
                            position: [0, 0, 16],
                            objects: [
                                {
                                    type: OBJECT_TYPE.CUBOID,
                                    size: [98, 4, 32],
                                    style: helpers.plaster,
                                },
                                {
                                    type: OBJECT_TYPE.CUBOID,
                                    size: [98, 4, doorHeaderHeight],
                                    position: [0, 0, doorHeight],
                                    style: helpers.plaster,
                                },
                                ...[0, 1, 2].map(idx => {
                                    return {
                                        ...makeWall(6, 4, cHeight - 32 - doorHeaderHeight),
                                        position: [(98 - 6) / 2 * idx, 0, 32],
                                    } as CuboidObjectModel
                                })
                            ],
                        },
                        { // w wall
                            type: OBJECT_TYPE.GROUP,
                            position: [0, 4, 16],
                            objects: [
                                { ...makeWall(4, 202.5-8, doorHeaderHeight), position: [0, 0, doorHeight], label: 'patio-w-header'},
                                { ...makeWall(4, 202.5-8, 32), position: [0, 0, 0], label: 'patio-w-base' },
                                ...[0, 1, 2, 3, 4].map(idx => {
                                    return {
                                        ...makeWall(4, 6, cHeight - 32 - doorHeaderHeight),
                                        position: [0, (202.5 - 8 - 6) / 4 * idx, 32],
                                        label: `patio-w-nub-${idx}`,
                                    } as CuboidObjectModel;
                                }),
                            ]
                        },
                        { // s wall
                            type: OBJECT_TYPE.GROUP,
                            position: [0, 202.5 - 4, 16],
                            objects: [
                                { ...makeWall(6, 4), position: [98-6, 0, 0]}, // right of door
                                { ...makeWall(32, 4, doorHeaderHeight), position: [98-6-32, 0, doorHeight]},
                                { ...makeWall(6, 4), position: [98-6-32-6, 0, 0]}, // left of door
                                { ...makeWall(6, 4)},
                                { ...makeWall(98 - 6 - 6 - 32 - 6, 4, 32), position: [6, 0, 0]},
                                { ...makeWall(98 - 6 - 6 - 32 - 6, 4, doorHeaderHeight), position: [6, 0, doorHeight]}
                            ]
                        }
                    ]
                },
            ]
        },
        {  // fancy skyscraper b
            type: OBJECT_TYPE.GROUP,
            size: [0, 0, 0],
            position: [5000, 5200, 0], // lift it up off the ground so we can get under it...
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
                    size: [200, 150, 73],
                    position: [15, 15, 77],
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
                            size: [5, 120, 20],
                            position: [5, 15, 0],
                            style: helpers.glass,
                        },
                        { // east
                            type: OBJECT_TYPE.CUBOID,
                            size: [5, 120, 20],
                            position: [190, 15, 0],
                            style: helpers.glass,
                        },
                        { // north
                            type: OBJECT_TYPE.CUBOID,
                            size: [170, 5, 20],
                            position: [15, 5, 0],
                            style: helpers.glass,
                        },
                        { // south
                            type: OBJECT_TYPE.CUBOID,
                            size: [170, 5, 20],
                            position: [15, 140, 0],
                            style: helpers.glass,
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
        },
        { // test 1, a basic cube, on the ground
            type: OBJECT_TYPE.CUBOID,
            size: [100, 100, 100],
            position: [5400, 5000, 0],
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
        { // a tree
            type: OBJECT_TYPE.GROUP,
            position: [4800, 5000, 0],
            size: [0, 0, 0],
            objects: [
                {  // trunk
                    type: OBJECT_TYPE.CUBOID,
                    position: [20, 20, 0],
                    size: [10, 10, 76],
                    style: helpers.brown
                },
                {
                    type: OBJECT_TYPE.CUBOID,
                    position: [0, 0, 77],
                    size: [50, 50, 50],
                    style: helpers.treeCanopy,
                },
                {
                    type: OBJECT_TYPE.CUBOID,
                    position: [0, 0, 77],
                    size: [50, 50, 50],
                    rotate: [130, 45, 0],
                    style: helpers.treeCanopy,
                },
            ]
        }
    ],
};