import { COMMAND } from "command";
import { Watched } from "watched";

export type CommandSet = Set<COMMAND>;
type MappedKeys = {[key: string]: COMMAND};
type CommandListener = (command: COMMAND) => void;

export class Input {

    private defaultKeyMap: MappedKeys = Object.freeze({
        KeyW: COMMAND.MOVE_UP,
        KeyA: COMMAND.MOVE_LEFT,
        KeyS: COMMAND.MOVE_DOWN,
        KeyD: COMMAND.MOVE_RIGHT,
        ShiftLeft: COMMAND.SPRINT,
        Escape: COMMAND.CANCEL, // this should not be remappable
    });

    private defaultCustomEvents = {
        wheelUp: COMMAND.ZOOM_IN,
        wheelDown: COMMAND.ZOOM_OUT,
    }

    private keyMap = { ...this.defaultKeyMap };
    private customEvents = { ...this.defaultCustomEvents };

    // holds a set of commands that are currently being instructed to fire
    activeCommands = new Watched(new Set<COMMAND>());
    // triggedCommands = new Watched<COMMAND | undefined>(undefined);

    private onCommandListeners: CommandListener[] = [];

    async initialize(): Promise<this> {
        document.addEventListener('keydown', ({code}) => {
            const c = this.keyMap[code];
            if (c) {
                if (c === COMMAND.CANCEL) {
                    console.log('esc hit'); /// TODO
                }
                const activeCommands = this.activeCommands.get();
                if (!activeCommands.has(c)) {
                    activeCommands.add(c);
                    this.activeCommands.set(new Set([...activeCommands])) // create a clone
                }
            }
        });
        document.addEventListener('keyup', ({ code }) => {
            const c = this.keyMap[code];
            if (c) {
                const activeCommands = this.activeCommands.get();
                if (activeCommands.has(c)) {
                    activeCommands.delete(c);
                    this.activeCommands.set(new Set([...activeCommands]));
                }
            }
        });
        document.addEventListener('wheel', ({ deltaY }) => {
            let c!: COMMAND;
            if (deltaY > 0) {
                c = this.customEvents.wheelDown;
            } else if (deltaY < 0) {
                c = this.customEvents.wheelUp;
            }
            if (c) {
                this.emitAction(c);
            }
        })
        return this;
    }

    onAction(callback: CommandListener) {
        this.onCommandListeners.push(callback);
    }

    private emitAction(command: COMMAND) {
        this.onCommandListeners.forEach(cb => cb(command));
    }
}