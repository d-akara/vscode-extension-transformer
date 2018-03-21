import * as vscode from 'vscode';

interface Macro {
    name: string
    content: string
}

interface MacroStorage {
    macros: Macro[]
}

export function resolveMacroFileLocation() {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath
    return workspacePath + '/.vscode/macros.json'
}

export function getMacroNames() {

}

export function fetchMacro(name:string) {

}

export function saveMacro(content:string) {

}