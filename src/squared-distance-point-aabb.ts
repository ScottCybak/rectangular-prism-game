import { Coordinates } from "coordinates";

// squared distance from point to AABB
export const squaredDistancePointAABB = (p: Coordinates, half: Coordinates): number => {
    let distSq = 0;

    for (let i = 0; i < 3; i++) {
        let v = p[i];
        if (v < -half[i]) distSq += (v + half[i]) ** 2;
        else if (v > half[i]) distSq += (v - half[i]) ** 2;
    }

    return distSq;
}