import { MacroCommand, MacroScriptExpression } from './MacroExpression';
import * as vscode from 'vscode';

registerCompletionProvider()

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
        const [commandType, commandName] = line.split(' ', 2)
        if (commandType === 'v')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: commandName})
    })

    return expression
}

export async function registerCompletionProvider() {
    const commands = await vscode.commands.getCommands(true).then(commandList => commandList);
    
    vscode.languages.registerCompletionItemProvider('macro', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            return commands.map(prompt => new vscode.CompletionItem('v ' + prompt, vscode.CompletionItemKind.Variable))
        }
    });
}
