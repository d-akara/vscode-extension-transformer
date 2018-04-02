import * as vscode from 'vscode';
import { Region,Lines,Modify,View,Application } from 'vscode-extension-common';

interface ExtendedCommand {
    name:string
    commandFn:(editor:vscode.TextEditor, parameter:any)=>void
}

const commands:ExtendedCommand[] = []

function registerCommands() {
    commands.push({name: 'cursorForwardUntil', commandFn: cursorForwardUntil})
}

function cursorForwardUntil(editor:vscode.TextEditor, parameter) {
    const cursorPosition = editor.selection.anchor
    const cursorOffset   = editor.document.offsetAt(cursorPosition)
    const documentText   = editor.document.getText()
    const matchIndex     = documentText.indexOf(parameter, cursorOffset)
    if (matchIndex === -1) return

    const matchPosition = editor.document.positionAt(matchIndex)
    editor.selection = new vscode.Selection(matchPosition, matchPosition)
}

export function getCommands() {
    if (!commands.length) registerCommands()
    return commands
}

export function executeCommand(commandName:string, editor:vscode.TextEditor, parameter:any) {
    const command = commands.find(command=>command.name === commandName)
    if (!command) return

    command.commandFn(editor, parameter)
}