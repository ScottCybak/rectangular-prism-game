import { Coordinates } from "coordinates";
import { ObjectModel } from "object-classes";

export interface WorldData {
    id: string;
    width: number;
    length: number;
    spawn: [number, number];
    objects: ObjectModel[];
}