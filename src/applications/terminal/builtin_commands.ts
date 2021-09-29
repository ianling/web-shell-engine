/**
 * This file contains all of the built-in commands found in the terminal.
 */

import {sleep as sleepUtil} from '../../util';
import {TerminalApplication} from './application';

/**
 * @return {number} the current UNIX timestamp
 */
export async function time() {
    return Date.now().toString();
}

export async function echo(terminal: TerminalApplication, ...args: string[]) {
    return args.slice(1).join(' ');
}

export async function clear(terminal: TerminalApplication) {
    terminal.clear();

    return '';
}

export async function clearLine(terminal: TerminalApplication) {
    terminal.clearLine();

    return '';
}

export async function disableInput(terminal: TerminalApplication) {
    terminal.disableInput();

    return '';
}

export async function enableInput(terminal: TerminalApplication) {
    terminal.enableInput();

    return '';
}

export async function sleep(terminal: TerminalApplication, ...args: string[]) {
    await sleepUtil(parseInt(args[1]));

    return '';
}
