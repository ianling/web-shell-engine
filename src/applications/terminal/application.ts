import {BaseTextApplication} from '../base_text_application';
import {sleep} from '../../util';
import {help, time, echo, clear, clearLine, disableInput, enableInput, sleep as sleepCommand,
    textSpeed as textSpeedCommand, timeHelpText, echoHelpText, clearHelpText, clearLineHelpText, disableInputHelpText,
    enableInputHelpText, sleepHelpText, timeBriefDescription, echoBriefDescription, clearBriefDescription,
    clearLineBriefDescription, disableInputBriefDescription, enableInputBriefDescription, sleepBriefDescription,
    helpHelpText, helpBriefDescription, textSpeedBriefDescription, textSpeedHelpText} from './builtin_commands';

const defaultTextSpeed = 1;

// text displayed when the terminal is first loaded
const terminalStartupText = 'INITIALIZING|sleep,400|.|sleep,400|.|sleep,400|.|sleep,300||clearline|' +
    'Welcome to web-shell!\nType \'help\' for commands\n|enableinput|';

export type TerminalCommandCallback = (terminal: TerminalApplication, ...args: string[]) => Promise<string>;

interface TerminalCommand {
    // the actual command that must be entered by the user in order to trigger the callback
    command: string,
    // brief description of the command displayed next to the command in the command list
    briefDescription: string
    // optional help text for the command when the user runs "help <command>"
    helpText?: string
    // the function that is run when the command is entered
    callback: TerminalCommandCallback,
}

/**
 * Terminal
 */
export class TerminalApplication extends BaseTextApplication {
    private cursor: string;
    public commands: Map<string, TerminalCommand>;
    private disableInputAfterCommand: boolean;
    private inputHistory: string[];
    private inputHistoryIndex: number;
    private textSpeed: number;
    private previousTextSpeed: number;

    constructor() {
        super('Terminal', '1.0.0', 'Terminal');

        this.cursor = '_';
        this.inputEnabled = false;
        this.disableInputAfterCommand = true;
        this.textSpeed = defaultTextSpeed;
        this.previousTextSpeed = defaultTextSpeed;

        this.commands = new Map<string, TerminalCommand>();
        this.registerBuiltinCommands();

        this.inputHistory = [];
        this.inputHistoryIndex = 0;

        this.windowBuffer = terminalStartupText;
    }

    private registerBuiltinCommands() {
        this.registerCommandCallback('help', help, helpBriefDescription, helpHelpText);
        this.registerCommandCallback('time', time, timeBriefDescription, timeHelpText);
        this.registerCommandCallback('echo', echo, echoBriefDescription, echoHelpText);
        this.registerCommandCallback('clear', clear, clearBriefDescription, clearHelpText);
        this.registerCommandCallback('clearline', clearLine, clearLineBriefDescription, clearLineHelpText);
        this.registerCommandCallback('enableinput', enableInput, enableInputBriefDescription, enableInputHelpText);
        this.registerCommandCallback('disableinput', disableInput, disableInputBriefDescription, disableInputHelpText);
        this.registerCommandCallback('sleep', sleepCommand, sleepBriefDescription, sleepHelpText);
        this.registerCommandCallback('textspeed', textSpeedCommand, textSpeedBriefDescription, textSpeedHelpText);
    }

    registerCommandCallback(command: string, callback: TerminalCommandCallback,
        briefDescription: string, helpText: string) {
        this.commands.set(command, {command, callback, helpText, briefDescription});
    }

    setTextSpeed(speed: number) {
        // track the previous text speed so we can reset back to that value after a temporary speed change
        // TODO: allow this to happen
        this.previousTextSpeed = this.textSpeed;
        this.textSpeed = speed;
    }

    getTextSpeed(): number {
        return this.textSpeed;
    }

    resetTextSpeed() {
        this.setTextSpeed(defaultTextSpeed);
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

    // TODO
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

        return this.commands.get(commandSplit[0])?.callback(this, ...commandSplit) ||
            `Unknown command '${commandSplit[0]}'`;
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
            // insert a random delay between character prints for added effect.
            // the length of the delay is inversely proportional to the terminal's textSpeed field
            await sleep(Math.random() * 30 * (1 / this.getTextSpeed()));
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
                await this.commands.get(command[0])?.callback(this, ...command);
        }

        this.windowBuffer = this.windowBuffer.slice(cmdEndIndex + 1);
    }
}
