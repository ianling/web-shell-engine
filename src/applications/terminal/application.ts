import {BaseApplication} from '../base_application';
import {sleep} from '../../util';
import {time, echo, clear, clearLine, disableInput, enableInput, sleep as sleepCommand} from './builtin_commands';

// text displayed when the terminal is first loaded
const terminalStartupText = 'INITIALIZING|sleep,400|.|sleep,400|.|sleep,400|.|sleep,300||clearline|' +
    'Welcome to web-shell!\nType \'help\' for commands\n|enableinput|';

export type TerminalCommandCallback = (terminal: TerminalApplication, ...args: string[]) => Promise<string>;

/**
 * Terminal
 */
export class TerminalApplication extends BaseApplication {
    private cursor: string;
    private window: HTMLDivElement;
    private commands: Map<string, TerminalCommandCallback>;
    private inputEnabled: boolean;
    private disableInputAfterCommand: boolean;
    private inputHistory: string[];
    private inputHistoryIndex: number;
    private inputBuffer: string;
    private windowBuffer: string;

    constructor() {
        super('Terminal', '1.0.0', 'Terminal');

        this.cursor = '_';

        this.inputEnabled = false;
        this.disableInputAfterCommand = true;

        this.commands = new Map<string, TerminalCommandCallback>();
        this.registerBuiltinCommands();

        this.inputHistory = [];
        this.inputHistoryIndex = 0;

        this.inputBuffer = '';

        this.window = document.body.appendChild(document.createElement('div'));
        this.window.setAttribute('id', 'application-window-terminal');

        this.windowBuffer = terminalStartupText;
    }

    private registerBuiltinCommands() {
        this.registerCommandCallback('time', time);
        this.registerCommandCallback('echo', echo);
        this.registerCommandCallback('clear', clear);
        this.registerCommandCallback('clearline', clearLine);
        this.registerCommandCallback('enableinput', enableInput);
        this.registerCommandCallback('disableinput', disableInput);
        this.registerCommandCallback('sleep', sleepCommand);
    }

    registerCommandCallback(command: string, fn: TerminalCommandCallback) {
        this.commands.set(command, fn);
    }

    backspace(n = 1) {
        this.window.innerText = this.window.innerText.slice(0, -n);
    }

    /**
     * Inserts the given string into the window div.
     * @param {string} str
     * @private
     */
    private addText(str: string) {
        this.window.innerText += str;
        this.window.scrollTop = this.window.scrollHeight;
    }

    /**
     * Adds the given string(s) to the window buffer to be processed and either executed (if it contains a command)
     * or displayed.
     * If more than one string is given, they will be joined by a space.
     * @param {...string[]} strings
     */
    echo(...strings: string[]) {
        const stringToAdd = strings.reduce((previousValue, currentValue) => `${previousValue} ${currentValue}`);
        this.windowBuffer += stringToAdd;
    }

    clear() {
        this.window.innerText = '';
    }

    clearLine() {
        const lineStartIndex = this.window.innerText.lastIndexOf('\n');
        this.window.innerText = this.window.innerText.slice(0, lineStartIndex + 1);
    }

    disableInput() {
        if (this.inputEnabled) {
            this.inputEnabled = false;
            // remove the underscore
            this.backspace();
        }
    }

    enableInput() {
        if (!this.inputEnabled) {
            this.inputEnabled = true;
            // insert cursor
            this.addText(this.cursor);
        }
    }

    async getUserInput(timeout = 60) {
        const key = null;

        const startTime = Date.now();
        while (key === null && Date.now() - startTime < timeout) {
            // ...
            await sleep(50);
        }
    }

    async executeCommand(command: string) {
        this.inputHistory.push(command);
        this.inputHistoryIndex = this.inputHistory.length - 1;
        const commandSplit = command.split(' ');

        return this.commands.get(commandSplit[0])?.(this, ...commandSplit) || `Unknown command '${commandSplit[0]}'`;
    }

    async keyboardHandler(e: KeyboardEvent) {
        if (!this.inputEnabled) {
            return;
        }

        switch (e.key) {
            case 'Enter':
                let reEnableInputAfterCommand = false;
                if (this.disableInputAfterCommand) {
                    if (this.inputEnabled) {
                        // make sure we get the user back into the correct state after the command finishes
                        reEnableInputAfterCommand = true;
                    }
                    this.disableInput();
                }

                this.addText('\n');

                // process the command the user entered, add output to the buffer
                this.inputBuffer = this.inputBuffer.trim();
                if (this.inputBuffer.length > 0) {
                    this.echo(await this.executeCommand(this.inputBuffer) + '\n');
                }

                this.inputBuffer = '';
                if (reEnableInputAfterCommand) {
                    this.echo('|enableinput|');
                }

                break;
            case 'Backspace':
                // remove the cursor so we can redraw it in the correct position after processing the backspace
                this.backspace();

                // don't allow user to backspace beyond the command they have entered
                if (this.inputBuffer.length > 0) {
                    this.inputBuffer = this.inputBuffer.slice(0, -1);
                    this.backspace();
                }

                // re-add the cursor
                this.addText(this.cursor);

                break;
            case 'ArrowUp':
                // save user's current input if the input isn't from browsing the command history,
                // and the input doesn't match the most recent command
                if (this.inputHistoryIndex === this.inputHistory.length - 1 && this.inputBuffer.length > 0 &&
                    this.inputBuffer !== this.inputHistory[this.inputHistoryIndex]) {
                    this.inputHistory.push(this.inputBuffer);
                }

                this.inputBuffer = this.inputHistory[this.inputHistoryIndex];
                // retrieve previous command if one exists
                if (this.inputHistoryIndex > 0) {
                    this.inputHistoryIndex -= 1;
                }

                this.clearLine();
                this.addText(this.inputBuffer);
                this.addText(this.cursor);

                break;
            case 'ArrowDown':
                if (this.inputHistoryIndex < this.inputHistory.length - 1) {
                    this.inputHistoryIndex += 1;
                } else {
                    // TODO: clear inputBuffer and current line
                }

                this.inputBuffer = this.inputHistory[this.inputHistoryIndex];

                this.clearLine();
                this.addText(this.inputBuffer);
                this.addText(this.cursor);

                break;
            // @ts-ignore -- ignoring intentional fallthrough
            case 'c':
                // check if user pressed ctrl+c
                if (e.ctrlKey) {
                    this.inputBuffer = '';
                    this.backspace();
                    this.addText('^c\n');
                    this.addText(this.cursor);
                    break;
                }

                // fallthrough
            default:
                if (e.key.length > 1) {
                    // e.g. "Shift", "Control", etc.
                    // we don't want to display anything for these
                    break;
                }

                // erase the cursor
                this.backspace();

                this.inputBuffer += e.key;
                this.addText(e.key);
                this.addText(this.cursor);

                break;
        }
    }

    async mainLoop() {
        if (this.windowBuffer.length === 0) {
            return;
        }

        // check if the current character is the beginning of a valid command
        // TODO: allow escaping pipe character to avoid accidentally executing a command
        if (this.windowBuffer[0] !== '|') {
            // just print the current character if it was not a command
            // insert a random delay between character prints for added effect
            await sleep(Math.random() * 30);
            this.addText(this.windowBuffer[0]);

            this.windowBuffer = this.windowBuffer.slice(1);

            return;
        }

        // we're dealing with a command enclosed in pipes. example: |disableinput|
        // find end of command
        const cmdEndIndex = this.windowBuffer.indexOf('|', 1);
        // extract and parse the command
        const command = this.windowBuffer.slice(1, cmdEndIndex).split(',');

        switch (command[0]) {
            case 'userinput':
                // TODO
                // let key = await getUserInput();
                // if key === ...
                break;
            default:
                // check if command was registered by something else
                await this.commands.get(command[0])?.(this, ...command);
        }

        this.windowBuffer = this.windowBuffer.slice(cmdEndIndex + 1);
    }
}
