// we need to create an index of all games, by their id

import { testGame } from "../data/test.game";

export const games: Map<string, string> = new Map([
    [testGame.id, 'test'],
]);