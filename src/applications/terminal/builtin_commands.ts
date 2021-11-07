/**
 * This file contains all of the built-in commands found in the terminal.
 */

import {sleep as sleepUtil} from '../../util';
import {TerminalApplication} from './application';

export const helpBriefDescription = 'prints detailed instructions for a given command, ' +
    'or a list of all available commands';
export const helpHelpText = `usage: help [command]\n${helpBriefDescription}`;
export async function help(terminal: TerminalApplication, ...args: string[]) {
    let command;
    if (args.length > 1) {
        command = args[1];
    }

    if (command) {
        return terminal.commands.get(command)?.helpText || `Unknown command '${command}'`;
    }

    // if no specific command was specified, return a list of all available commands
    let helpText = '';
    terminal.commands.forEach((command) => {
        helpText += `${command.command}`;
        if (command.briefDescription) {
            helpText += ` - ${command.briefDescription}`;
        }
        helpText += '\n';
    });

    return helpText;
}

export const timeBriefDescription = 'prints the current Unix timestamp to the screen';
export const timeHelpText = timeBriefDescription;
export async function time() {
    return Date.now().toString();
}

export const echoBriefDescription = 'prints the given text to the screen';
export const echoHelpText = `usage: echo <text>\n${echoBriefDescription}`;
export async function echo(terminal: TerminalApplication, ...args: string[]) {
    return args.slice(1).join(' ');
}

export const textSpeedBriefDescription = 'prints the current text speed multiplier, or sets the multiplier to ' +
    'the given value';
export const textSpeedHelpText = `usage: textspeed [multiplier]`;
export async function textSpeed(terminal: TerminalApplication, ...args: string[]) {
    if (args.length > 1) {
        const speed = parseInt(args[1]) || 1;
        terminal.setTextSpeed(speed);
        return '';
    }

    return `${terminal.getTextSpeed()}`;
}

export const clearBriefDescription = 'clears all text from the screen';
export const clearHelpText = clearBriefDescription;
export async function clear(terminal: TerminalApplication) {
    terminal.clear();

    return '';
}

export const clearLineBriefDescription = 'clears the current line';
export const clearLineHelpText = clearLineBriefDescription;
export async function clearLine(terminal: TerminalApplication) {
    terminal.clearLine();

    return '';
}

export const disableInputBriefDescription = 'disables keyboard input';
export const disableInputHelpText = disableInputBriefDescription;
export async function disableInput(terminal: TerminalApplication) {
    terminal.disableInput();

    return '';
}

export const enableInputBriefDescription = 'enables keyboard input';
export const enableInputHelpText = enableInputBriefDescription;
export async function enableInput(terminal: TerminalApplication) {
    terminal.enableInput();

    return '';
}

export const sleepBriefDescription = 'pauses execution for the given number of seconds';
export const sleepHelpText = `usage: sleep <number>\n${sleepBriefDescription}`;
export async function sleep(terminal: TerminalApplication, ...args: string[]) {
    await sleepUtil(parseInt(args[1]));

    return '';
}
