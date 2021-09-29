import {BaseTextApplication} from '../base_text_application';

const emailStartupText = 'Starting email...';

export class EmailApplication extends BaseTextApplication {
    constructor() {
        super('Email', '1.0.0', 'Email');

        this.echo(emailStartupText);
    }

    async mainLoop() {
        await super.mainLoop();

        if (this.inputBuffer.indexOf('x') !== -1) {
            this.close();
        }
    }

    async keyboardHandler(e: KeyboardEvent) {
        console.log(`pressed ${e.key} in email application`);
        await super.keyboardHandler(e);
    }
}

