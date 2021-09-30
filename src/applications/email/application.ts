import {BaseTextApplication} from '../base_text_application';

const emailStartupText = 'Starting email...\n';

type MenuOptionCallback = (application: EmailApplication) => void;

/**
 * A MenuOption consists of a label string and a callback function.
 * The label is printed after the keystroke assigned to this MenuOption, and the callback function is executed
 * when the keystroke is pressed by the user.
 */
interface MenuOption {
    label: string
    callback: MenuOptionCallback
}

/**
 * MenuOptions are lookup tables of keystrokes to MenuOption objects.
 * For example, {'1': {label: 'This callback function will execute when you press 1', callback: () => {}}}
 */
type MenuOptions = Record<string, MenuOption>;

/**
 * A Menu consists of a text string and one or more MenuOptions.
 */
interface Menu {
    text: string,
    options: MenuOptions
}

export class EmailApplication extends BaseTextApplication {
    private currentMenu!: Menu;

    constructor() {
        super('Email', '1.0.0', 'Email');

        this.echo(emailStartupText);

        this.showMenu('Make a choice\n', {
            '1': {label: 'Continue\n', callback: (application) => {
                application.echo('yeehaw\n');
            }},
            '2': {label: 'Don\'t continue\n', callback: (application) => {
                application.echo('woopsie\n');
            }},
        });
    }

    showMenu(text: string, options: MenuOptions) {
        this.currentMenu = {text: text, options: options};

        this.echo(text);
        for (const key in options) {
            if (!options.hasOwnProperty(key)) continue;

            this.echo(`${key}) ${options[key].label}`);
        }
    }

    async mainLoop() {
        await super.mainLoop();

        // check if any keystrokes in the input buffer match one with an assigned callback for our current menu
        for (const char of this.inputBuffer) {
            if (this.currentMenu.options.hasOwnProperty(char)) {
                this.currentMenu.options[char].callback(this);
                this.inputBuffer = '';

                break;
            }
        }

        // maybe temporary? close email if 'x' is pressed
        if (this.inputBuffer.indexOf('x') !== -1) {
            this.close();
        }
    }

    async keyboardHandler(e: KeyboardEvent) {
        await super.keyboardHandler(e);
    }
}

