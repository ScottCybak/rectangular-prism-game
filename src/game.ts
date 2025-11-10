import { COMMAND } from "command";
import { Environment } from "environment";
import { GameData } from "game-data";
import { getJson } from "get-json";
import { Watched } from "watched";
import { World } from "world";
import { WorldData } from "world-data";

export class Game {

    element = document.getElementById('root');

    private gameData = new Watched<GameData | undefined>(undefined);

    private worldData = new Watched<WorldData | undefined>(undefined);
    
    private paused = new Watched(true);

    private tickInterval = new Watched(new Date().getTime());

    tick = Watched.combine(this.paused, this.tickInterval).derive(([paused, tick]) => paused ? false : tick);
    
    private playerRadius = this.worldData.derive(data => data?.playerRadius ?? 1);

    private world = new World(this);

    constructor(public commands: Watched<Set<COMMAND>>) {
        setInterval(() => {
            this.tickInterval.set(new Date().getTime());
        }, 1000 / 30);
        this.playerRadius.watch(radius => this.element?.style.setProperty('--pl-rad', `${radius ?? 0}px`))
    }

    ready = Watched.combine(
        this.world.ready
    ).derive(r => {
        return r.every(v => !!v)
    });

    onCommandsChanged(commands: Set<COMMAND>) {
        console.log('comamnds changed', commands);
        // this.world.doCommands(commands);
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
            return true;
        }
        return false;
    }

    private loadWorldData(data: WorldData) {
        console.log('loadworlddata', data);
        this.world.ready.watch(r => {
            this.paused.set(!r)
        });
        this.world.loadData(data);
    }
    
    private unloadWorld() {
        console.log('unloadWorld');
    }
}