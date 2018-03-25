import * as vscode from 'vscode';
import * as fs from 'fs'

interface Macro {
    name: string
    content: string
}

interface MacroStorage {
    macros: Macro[]
}

let macroStore:MacroStorage = {macros:[]}

function resolveMacroFileLocation() {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath
    return workspacePath + '/.vscode/macros.json'
}

function loadMacros():Promise<MacroStorage> {
    return new Promise(resolve => {
        const filename = resolveMacroFileLocation()
        fs.readFile(filename, 'utf8', function(err, data) {
            if (err) resolve({macros:[]})
            else {
                macroStore = JSON.parse(data) as MacroStorage
                resolve(macroStore)
            }
        });
    })
}

function saveMacros(macros:MacroStorage):Promise<Error> {
    return new Promise(resolve => {
        const filename = resolveMacroFileLocation()
        fs.writeFile(filename, JSON.stringify(macros), error => {
            if (error) resolve(error)
        })
    })
}

export function getMacroNames() {
    return loadMacros()
}

export function fetchMacro(name:string) {

}

export function saveMacro(macroName:string, content:string) {
    macroStore.macros.push({name:macroName, content})
    return saveMacros(macroStore)
}