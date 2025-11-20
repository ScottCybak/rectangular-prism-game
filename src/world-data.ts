import { Coordinates } from "coordinates";
import { MinMax } from "min-max";
import { ObjectModel } from "objects/object-classes";
import { GroupObjectModel } from "objects/group";
import { CreatureModel } from "creatures/creature-classes";

export interface WorldData {
    id: string;
    width: number;
    length: number;
    spawn: Coordinates;
    objects: ObjectModel[];
    avatar: CreatureModel;
    perspective: number;
    speed: MinMax;
    playerRadius: number;
    zoom: MinMax;
    tileSize: number;
    verticalStep: number;
}