/**
* web shell engine
* (c) Ian Ling 2021
* This source code is released to the public under the GNU General Public License (GPL).
***/

import BaseApplication from './applications/base_application';
import {TerminalApplication} from './applications/terminal/application';
import {EmailApplication} from './applications/email/application';

import {sleep} from './util';

export class Webshell {
    private runningApplications: BaseApplication[];
    private focusedApplication: BaseApplication | undefined;

    constructor() {
        this.runningApplications = [];
        this.focusedApplication = undefined;
    }

    startApplication(application: BaseApplication) {
        application.running = true;

        this.focusedApplication = application;
        this.runningApplications.push(application);

        this.focusedApplication.run().then(() => {
            // when this application finishes running, remove it from runningApplications and
            // make sure we know it's no longer in focus
            this.runningApplications = this.runningApplications.filter((item) => item !== application);

            if (this.focusedApplication === application) {
                this.focusedApplication = this.runningApplications[0];
            }
        });
    }

    async keyboardHandler(e: KeyboardEvent) {
        e.preventDefault();

        if (this.focusedApplication != undefined) {
            await this.focusedApplication.keyboardHandler(e);
            return;
        }
    }

    async start() {
        document.addEventListener('keydown', this.keyboardHandler.bind(this), true);

        const terminal = new TerminalApplication();

        // register commands that allow us to start other applications from the terminal
        terminal.registerCommandCallback('email', async () => {
            this.startApplication(new EmailApplication());

            return '';
        });

        this.startApplication(terminal);
    }
}
