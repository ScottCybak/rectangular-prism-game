import { Coordinates } from "coordinates";
import { ObjectBase, ObjectBaseModel } from "objects/object-base";
import { objectClasses, ObjectModel } from "objects/object-classes";
import { OBJECT_TYPE } from "objects/object-type";

export interface GroupObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.GROUP;
    objects: ObjectModel[];
}

export class GroupObject extends ObjectBase<GroupObjectModel> {

    loadedObjects: ObjectBase<ObjectModel>[] = [];

    adjustPoint([a, b, c]: Coordinates): Coordinates {
        const [x, y, z] = this.data.position ?? [0, 0, 0];
        return [a - x, b - y, c - z];
    }

    canMoveOnto(to: Coordinates, radius: number, height: number): false | Coordinates {
        const adjustedTo = this.adjustPoint(to);

        const match = this.loadedObjects
            .map(o => o.canMoveOnto(adjustedTo, radius, height))
            .find(o => !!o);
        if (match) {
            return match;
        }
        return false;
    }

    recalculateDimensions(): void {
        const x = [0];
        const y = [0];
        this.loadedObjects
            .forEach(({ width, height, data }) => {
                const position = data.position ?? [0, 0, 0];
                x.push(width + position[0]);
                y.push(height + position[1]);
            });
        const w = this.width = Math.max(...x);
        const h = this.height = Math.max(...y);
        this.element.style.setProperty('--w', `${w}px`);
        this.element.style.setProperty('--l', `${h}px`);
    }
    
    hideByCoordinates(point: Coordinates) {
        const adjustedPoint = this.adjustPoint(point);
        const hideGroups = !!(this.loadedObjects.filter(o => !(o instanceof GroupObject)).filter(o => o.hideByCoordinates(adjustedPoint)).length);
        this.loadedObjects.filter(o => o instanceof GroupObject).forEach(o => o.isHidden.set(hideGroups));
        return false;
    }
    
    doesPointIntersect(point: Coordinates, radius: number, height: number): boolean {
        const adjustedPoint = this.adjustPoint(point);
        return this.loadedObjects.some(o => o.doesPointIntersect(adjustedPoint, radius, height));
    }

    create(): this {
        this.createObjects(this.data.objects, this.element);
        this.recalculateDimensions();
        return this;
    }

    // this is similar to the world method
    // consider splitting to avoid duplication
    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        const { loadedObjects } = this;
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                loadedObjects.push(new Klass(o, this.world).create().place(container));
            } else {
                console.warn('no class found', o);
            }
        })
    }
}