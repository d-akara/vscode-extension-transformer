import { MacroCommand, MacroScriptExpression } from './MacroExpression';
export enum CommandType {
    VSCODE_COMMAND
}

export interface MacroCommand {
    type: CommandType
    command: string
    parameters?: any[]
}

export interface MacroScriptExpression {
    commands: MacroCommand[]
}

export function parseScript(script:string) {
    const expression:MacroScriptExpression = {commands: []}

    const allLines = script.split(/\r?\n/);
    allLines.forEach(line => {
        const [commandType, commandName] = line.split(':')
        if (commandType === 'vsc')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: commandName})
    })

    return expression
}