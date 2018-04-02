import * as vscode from 'vscode';
import * as ExtendedCommands from './ExtendedCommands'


registerCompletionProvider()

export enum CommandType {
    VSCODE_COMMAND,
    EXTENDED_COMMAND
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

function splitCommandAndParameter(commandAndParameter:string) {

    return commandAndParameter.split(' ', 2)
}

export function parseScript(script:string) {
    const expression:MacroScriptExpression = {commands: []}

    const allLines = script.split(/\r?\n/);
    allLines.forEach(line => {
        const [commandType, commandPart] = splitMacroTypeAndCommand(line)
        if (commandType === 'v' || commandType === 'c' || commandType === 's')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: commandPart})
        if (commandType === 't')
            expression.commands.push({type: CommandType.VSCODE_COMMAND, command: 'type', parameters: [{text: JSON.parse(commandPart)}] })
        if (commandType === 'x') {
            const [command, parameter] = splitCommandAndParameter(commandPart)
            expression.commands.push({type: CommandType.EXTENDED_COMMAND, command, parameters: [parameter] })
        }
    })

    return expression
}

export async function registerCompletionProvider() {
    const commands = await vscode.commands.getCommands(true).then(commandList => commandList);
    const extendedCommands = ExtendedCommands.getCommands()
    
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
            if (character === 'x')
                return extendedCommands.map(extendedCommand => new vscode.CompletionItem('x ' + extendedCommand.name, vscode.CompletionItemKind.Variable))
        }
    });
}
