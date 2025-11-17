import { Camera } from "camera";
import { COMMAND } from "command";
import { createDiv } from "create-div";
import { GameData } from "game-data";
import { getJson } from "get-json";
import { Watched } from "watched";
import { World } from "world";
import { WorldData } from "world-data";

export class Game {

    static perspectiveCssVar = '--p';
    static playerRadiusCssVar = '--pl-rad';

    element = createDiv('game');

    private gameData = new Watched<GameData | undefined>(undefined);

    private worldData = new Watched<WorldData | undefined>(undefined);
    
    private paused = new Watched(true);

    private tickInterval = new Watched(new Date().getTime());

    tick = Watched.combine(this.paused, this.tickInterval).derive(([paused, tick]) => paused ? false : tick);
    
    private playerRadius = this.worldData.derive(d => d?.playerRadius ?? 1);

    perspective = this.worldData.derive(d => d?.perspective ?? 400);
    
    world = new World(this);

    constructor(
        public commands: Watched<Set<COMMAND>>,
    ) {
        setInterval(() => {
            this.tickInterval.set(new Date().getTime());
        }, 1000 / 30);

        const { element } = this;
        element.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: hidden;
            perspective: var(${Game.perspectiveCssVar});
            perspective-origin: 50% 50%;
        `;
        this.playerRadius.watch(radius => element.style.setProperty(Game.playerRadiusCssVar, `${radius ?? 0}px`));
        this.perspective.watch(perspective => element.style.setProperty(Game.perspectiveCssVar, `${perspective}px`));
    }
    
    ready = Watched.combine(
        this.world.ready
    ).derive(r => {
        return r.every(v => !!v)
    });

    doCommand(command: COMMAND) {
        // for now, we have nothing directly listening, so lets just pass it down
        this.world?.doAction(command);
    }

    private watchers = [
        this.worldData.watch(data => data ? this.loadWorldData(data) : this.unloadWorld()),
    ];

    async loadGame(gameId?: string): Promise<boolean> {
        if (gameId) {
            const path = `data/${gameId}.game.json`;
            const game = await getJson<GameData>(path);
            if (game) {
                this.gameData.set(game);
                return this.loadWorld(game.world);
            }
        }
        return false;
    }

    private async loadWorld(worldId: string): Promise<boolean> {
        const path = `data/${worldId}.world.json`;
        const world = await getJson<WorldData>(path);
        if (world) {
            this.worldData.set(world);
            document.getElementById('root')?.appendChild(this.element);
            return true;
        }
        return false;
    }

    private loadWorldData(data: WorldData) {
        console.log('loadworlddata', data);
        const style = this.element.style;
        this.world.ready.watch(r => {
            this.paused.set(!r)
        });
        this.world.loadData(data);
    }
    
    private unloadWorld() {
        // todo
    }

}