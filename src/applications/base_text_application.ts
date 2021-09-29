import {BaseApplication} from './base_application';
import {sleep} from '../util';

/**
 * BaseTextApplication is an abstract base class that extends BaseApplication to provide a base for
 * text-based applications.
 * It provides a "window" (a div), a string buffer that can be used to print text to the window each frame,
 * and a string buffer containing the text received from keyboard events.
 *
 * The provided window/div is given the id `application-window-<application_name>`.
 * The input buffer can be read and acted upon by overriding the `mainLoop` method.
 * Text can be added to the window buffer using the `echo` method.
 */
export abstract class BaseTextApplication extends BaseApplication {
    protected window: HTMLDivElement;
    protected inputBuffer: string;
    protected windowBuffer: string;
    protected inputEnabled: boolean;

    protected constructor(name: string, version: string, description: string) {
        super(name, version, description);

        this.inputEnabled = true;
        this.inputBuffer = '';
        this.windowBuffer = '';

        this.window = document.body.appendChild(document.createElement('div'));
        this.window.setAttribute('id', `application-window-${this.getName()}`);
    }

    public close() {
        super.close();

        document.body.removeChild(this.window);
    }

    /**
     * Removes one or more characters from the window div, starting from the end, simulating a backspace.
     * @param {number} n the number of characters to remove (default: 1)
     */
    backspace(n = 1) {
        this.window.innerText = this.window.innerText.slice(0, -n);
    }

    /**
     * Inserts the given string into the window div.
     * @param {string} str
     * @private
     */
    protected addText(str: string) {
        this.window.innerText += str;
        this.window.scrollTop = this.window.scrollHeight;
    }

    /**
     * Adds the given string(s) to the window buffer to be displayed.
     * If more than one string is given, they will be joined by a space.
     * @param {...string[]} strings
     */
    echo(...strings: string[]) {
        const stringToAdd = strings.reduce((previousValue, currentValue) => `${previousValue} ${currentValue}`);
        this.windowBuffer += stringToAdd;
    }

    /**
     * Clears the window div completely.
     */
    clear() {
        this.window.innerText = '';
    }

    /**
     * Clears the window div up to the last newline character.
     */
    clearLine() {
        const lineStartIndex = this.window.innerText.lastIndexOf('\n');
        this.window.innerText = this.window.innerText.slice(0, lineStartIndex + 1);
    }

    /**
     * Disables the input buffer, discarding all keyboard events.
     */
    disableInput() {
        this.inputEnabled = false;
    }

    /**
     * Enables the input buffer, storing all keypresses in the buffer.
     */
    enableInput() {
        this.inputEnabled = true;
    }

    async keyboardHandler(e: KeyboardEvent) {
        if (!this.inputEnabled) {
            return;
        }

        switch (e.key) {
            case 'Backspace':
                // don't allow user to backspace beyond the command they have entered
                if (this.inputBuffer.length > 0) {
                    this.inputBuffer = this.inputBuffer.slice(0, -1);
                }

                break;
            default:
                if (e.key.length > 1) {
                    // e.g. "Shift", "Control", etc.
                    // we don't add these to the input buffer
                    break;
                }

                this.inputBuffer += e.key;
                break;
        }
    }

    async mainLoop() {
        if (this.windowBuffer.length === 0) {
            return;
        }

        // just print the current character if it was not a command
        // insert a random delay between character prints for added effect
        await sleep(Math.random() * 30);
        this.addText(this.windowBuffer[0]);

        this.windowBuffer = this.windowBuffer.slice(1);
    }
}
