import { Coordinates } from "coordinates";

export const worldToLocal = (p: Coordinates, center: Coordinates, R: number[][]): Coordinates => {
    const dx = p[0] - center[0];
    const dy = p[1] - center[1];
    const dz = p[2] - center[2];
    return [
        R[0][0] * dx + R[0][1] * dy + R[0][2] * dz,
        R[1][0] * dx + R[1][1] * dy + R[1][2] * dz,
        R[2][0] * dx + R[2][1] * dy + R[2][2] * dz,
    ];
}
