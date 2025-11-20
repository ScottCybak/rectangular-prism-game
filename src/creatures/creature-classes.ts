import { World } from "world";
import { CreatureBase } from "./creature-base";
import { CREATURE_TYPE } from "./creature-type";
import { HumanoidCreature, HumanoidCreatureModel } from "./humanoid";

export type CreatureModel = HumanoidCreatureModel;

type CreatureClasses = {
    [key in CREATURE_TYPE]: new (data: any, world: World) => CreatureBase<any>;
}

export const creatureClasses: CreatureClasses = {
    [CREATURE_TYPE.HUMANOID]: HumanoidCreature,
}