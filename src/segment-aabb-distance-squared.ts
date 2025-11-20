import { Coordinates } from "coordinates";
import { squaredDistancePointAABB } from "squared-distance-point-aabb";

// squared distance between a segment and an AABB at origin
export const segmentAABBDistanceSquared = (
    p0: Coordinates,
    p1: Coordinates,
    halfSize: Coordinates
): number => {
    // Parametric segment p(t) = p0 + t*(p1-p0)
    const d = [
        p1[0] - p0[0],
        p1[1] - p0[1],
        p1[2] - p0[2]
    ];

    // use iterative clipping to find t-range where segment penetrates AABB
    let tmin = 0;
    let tmax = 1;

    for (let i = 0; i < 3; i++) {
        if (Math.abs(d[i]) < 1e-8) {
            // segment parallel to slab
            if (p0[i] < -halfSize[i] || p0[i] > halfSize[i])
                return squaredDistancePointAABB(p0, halfSize); // distance to closest point
        } else {
            const ood = 1 / d[i];
            let t1 = (-halfSize[i] - p0[i]) * ood;
            let t2 = (halfSize[i] - p0[i]) * ood;

            if (t1 > t2) [t1, t2] = [t2, t1];
            if (t1 > tmin) tmin = t1;
            if (t2 < tmax) tmax = t2;
            if (tmin > tmax) {
                return squaredDistancePointAABB(p0, halfSize); // no intersection, check endpoint distance
            }
        }
    }

    // If we reach here, the segment intersects the AABB.
    return 0;
}