import { Coordinates } from "coordinates";
import { ObjectBase, ObjectBaseModel } from "object-base";
import { objectClasses, ObjectModel } from "object-classes";
import { OBJECT_TYPE } from "object-type";

export interface GroupObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.GROUP;
    objects: ObjectModel[];
}

const getAllChildren = (group: GroupObject, point: Coordinates): ObjectBase<any>[] => {
    // const nonGroups = group.data.objects.filter(o => !(o instanceof GroupObject));
    const result: ObjectBase<any>[] = [];
    group.loadedObjects.forEach(obj => {
        if (obj instanceof GroupObject) {
            const adjustedPoint = group.adjustPoint(point);
            result.push(...getAllChildren(obj, adjustedPoint))
        } else if (obj.containsPoint(point)) {
            result.push(obj);
        }
    });
    return result;
}

export class GroupObject extends ObjectBase<GroupObjectModel> {

    loadedObjects: ObjectBase<any>[] = [];

    adjustPoint([a, b, c]: Coordinates): Coordinates {
        const [x, y, z] = this.data.position ?? [0, 0, 0];
        return [a - x, b - y, c - z];
    }

    containsPoint(point: Coordinates): boolean {
        return false;
    }
    
    hideByCoordinates(point: Coordinates) {
        const adjustedPoint = this.adjustPoint(point);
        const hideGroups = !!(this.loadedObjects.filter(o => !(o instanceof GroupObject)).filter(o => o.hideByCoordinates(adjustedPoint)).length);
        this.loadedObjects.filter(o => o instanceof GroupObject).forEach(o => o.isHidden.set(hideGroups));
        return false;
    }
    
    doesPointIntersect(point: Coordinates, radius: number): boolean {
        const adjustedPoint = this.adjustPoint(point);
        return this.loadedObjects.some(o => o.doesPointIntersect(adjustedPoint, radius));
    }

    create(): this {
        this.createObjects(this.data.objects, this.element);
        return this;
    }

    // this is similar to the world method
    // consider splitting to avoid duplication
    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        const { loadedObjects } = this;
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                const instance = new Klass(o).create().place(container);
                loadedObjects.push(instance);
            } else {
                console.warn('no class found', o);
            }
        })
    }
}