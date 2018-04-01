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

function splitMacroTypeAndCommand(line:string) {
    const indexOfSpace = line.indexOf(' ')
    return [line.slice(0,indexOfSpace), line.slice(indexOfSpace + 1, line.length)]
}

export function parseScript(script:string) {
    const expression:MacroScriptExpression = {commands: []}

    const allLines = script.split(/\r?\n/);
    allLines.forEach(line => {
        const [commandType, commandName] = splitMacroTypeAndCommand(line)
        if (commandType === 'v' || commandType === 'c' || commandType === 's')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: commandName})
        if (commandType === 't')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: 'type', parameters: [{text: JSON.parse(commandName)}] })
    })

    return expression
}

export async function registerCompletionProvider() {
    const commands = await vscode.commands.getCommands(true).then(commandList => commandList);
    
    vscode.languages.registerCompletionItemProvider('macro', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            if (position.character !== 1) return

            const range = new vscode.Range(new vscode.Position(position.line,0), new vscode.Position(position.line,1))
            const character = document.getText(range)
            if (character === 'c')
                return commands.filter(prompt => /cursor/i.test(prompt))
                               .map(prompt => new vscode.CompletionItem('c ' + prompt, vscode.CompletionItemKind.Variable))
            if (character === 's')
                return commands.filter(prompt => /select/i.test(prompt))
                               .map(prompt => new vscode.CompletionItem('s ' + prompt, vscode.CompletionItemKind.Variable))
            if (character === 'v')
                return commands.map(prompt => new vscode.CompletionItem('v ' + prompt, vscode.CompletionItemKind.Variable))
        }
    });
}
