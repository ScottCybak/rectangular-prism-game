import { Game } from "game";
import { games } from "games";
import { Input } from "input";
import { Watched } from "watched";

export class Environment {
    private input = new Input();
    private loading = new Watched(true);
    private game!: Game;

    commands = this.input.activeCommands;

    async initialize(): Promise<this> {        
        this.loading.watch(loading => this.onLoadingChange(loading));
        await this.input.initialize();
        return this;
    }

    async startup() {
        const game = this.game = new Game(this.commands);
        const ready = await game.loadGame(games.get('test'));
        if (ready) {
            this.input.onAction(command => this.game?.doCommand(command));
            game.ready.watch(r => this.loading.set(!r));
        }
    }

    private onLoadingChange(loading: boolean) {
        this.toggleLoadingOverlay(loading);
    }

    private toggleLoadingOverlay(loading: boolean) {
        document.getElementById('loading')?.classList[loading ? 'remove' : 'add']('hidden');
    }

}