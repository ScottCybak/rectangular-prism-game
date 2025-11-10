import { XY } from "object-base";
import { ObjectModel } from "object-classes";

export interface WorldData {
    id: string;
    width: number;
    length: number;
    spawn: XY;
    objects: ObjectModel[];
    perspective: number;
}