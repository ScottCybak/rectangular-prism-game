import { Coordinates } from "coordinates";
import { MinMax } from "min-max";
import { ObjectModel } from "object-classes";

export interface WorldData {
    id: string;
    width: number;
    length: number;
    spawn: Coordinates;
    objects: ObjectModel[];
    perspective: number;
    speed: MinMax;
    playerRadius: number;
    zoom: MinMax;
}