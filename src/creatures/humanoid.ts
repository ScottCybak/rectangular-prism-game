import { CuboidObject } from "objects/cuboid";
import { CreatureBase, CreatureBaseModel } from "./creature-base";
import { CREATURE_TYPE } from "./creature-type";
import { OBJECT_TYPE } from "objects/object-type";

export interface HumanoidCreatureModel extends CreatureBaseModel {
    type: CREATURE_TYPE.HUMANOID,
}

export class HumanoidCreature extends CreatureBase<HumanoidCreatureModel> {

    private cuboid!: CuboidObject;

    create() {
        const e = this.element;
        
        e.classList.add('creature-humaoid');

        const cuboid = this.cuboid = new CuboidObject({
            type: OBJECT_TYPE.CUBOID,
            size: this.size.get(),
        }, this.world).create().place(e);

        return this;
    }

}