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

export async function getMacroNames() {
    const macros = await loadMacros()
    return macros.macros.map(macro => macro.name)
}

export async function fetchMacro(name:string) {
    const macros = await loadMacros()
    return macros.macros.find(macro => macro.name === name)
}

export function saveMacro(macroName:string, content:string) {
    macroStore.macros.push({name:macroName, content})
    return saveMacros(macroStore)
}