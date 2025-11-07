import { ObjectBase } from "object-base";
import { OBJECT_TYPE } from "object-type";
import { CuboidObject, CuboidObjectModel } from "objects/cuboid";

export type ObjectModel = CuboidObjectModel;

type ObjectClasses = {
    [key in OBJECT_TYPE]: new (data: any) => ObjectBase<any>;
}

export const objectClasses: ObjectClasses = {
    [OBJECT_TYPE.CUBOID]: CuboidObject,
}