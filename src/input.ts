import { COMMAND } from "command";
import { Watched } from "watched";

export type CommandSet = Set<COMMAND>;
type MappedKeys = {[key: string]: COMMAND};
type CommandListener = (commands: CommandSet) => void;

export class Input {

    private defaultKeyMap: MappedKeys = Object.freeze({
        w: COMMAND.MOVE_UP,
        a: COMMAND.MOVE_LEFT,
        s: COMMAND.MOVE_DOWN,
        d: COMMAND.MOVE_RIGHT,
        Escape: COMMAND.CANCEL, // this should not be remappable
    });

    private keyMap = { ...this.defaultKeyMap };

    // holds a set of commands that are currently being instructed to fire
    activeCommands = new Watched(new Set<COMMAND>());

    private onCommandListeners: CommandListener[] = [];

    async initialize(): Promise<this> {
        document.addEventListener('keydown', ({key}) => {
            const c = this.keyMap[key];
            if (c) {
                const activeCommands = this.activeCommands.get();
                if (!activeCommands.has(c)) {
                    activeCommands.add(c);
                    this.activeCommands.set(new Set([...activeCommands])) // create a clone
                }
            }
        });
        document.addEventListener('keyup', ({ key }) => {
            const c = this.keyMap[key];
            if (c) {
                const activeCommands = this.activeCommands.get();
                if (activeCommands.has(c)) {
                    activeCommands.delete(c);
                    this.activeCommands.set(new Set([...activeCommands]));
                }
            }
        });
        return this;
    }

    onCommand(callback: CommandListener) {
        this.onCommandListeners.push(callback);
    }

    private emitCommands(commands: CommandSet) {
        this.onCommandListeners.forEach(cb => cb(commands));
    }
}