export type Coordinates = [
    number /* x */,
    number /* y */,
    number /* z */
];

export const isCoordinates = (value: unknown): value is Coordinates => {
    return Array.isArray(value)
        && value.length === 3
        && typeof value[0] === 'number' && Number.isFinite(value[0])
        && typeof value[1] === 'number' && Number.isFinite(value[1])
        && typeof value[2] === 'number' && Number.isFinite(value[2])
} 