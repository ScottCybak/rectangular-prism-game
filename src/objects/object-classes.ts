import { CuboidObject, CuboidObjectModel } from "objects/cuboid";
import { GroupObject, GroupObjectModel } from "objects/group";
import { ObjectBase } from "objects/object-base";
import { OBJECT_TYPE } from "objects/object-type";
import { World } from "world";

export type ObjectModel = CuboidObjectModel | GroupObjectModel;

type ObjectClasses = {
    [key in OBJECT_TYPE]: new (data: any, world: World) => ObjectBase<any>;
}

export const objectClasses: ObjectClasses = {
    [OBJECT_TYPE.CUBOID]: CuboidObject,
    [OBJECT_TYPE.GROUP]: GroupObject,
}