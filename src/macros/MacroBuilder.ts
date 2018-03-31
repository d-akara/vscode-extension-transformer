'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { Region,Lines,Modify,View,Application } from 'vscode-extension-common';
import * as MacroRepository from './MacroRepository'
import * as MacroExpression from './MacroExpression'

const DEFAULT_SCRIPT = "// write macro\n" +
                       "\n" +
                       "\n"

const cursorDecorationType = View.createCursorDecoratorType()
let currentMacroScript = ''
let scriptEditor:vscode.TextEditor

async function evalFunctionExpression(expression:string) {
    const macroExpression = MacroExpression.parseScript(expression)
    for (const command of macroExpression.commands) {
        const parameters = [command.command].concat(command.parameters)
        await vscode.commands.executeCommand.apply(this, parameters)
    }   
}

async function evalFunctionExpressionAsPreview(expression:string, previewEditor:vscode.TextEditor) {
    const previousColumnActive = vscode.window.activeTextEditor.viewColumn
    // TODO find editor with preview and the change focus to that group

    await View.setFocusOnEditorColumn(previewEditor.viewColumn)
    await evalFunctionExpression(expression)
    previewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(previewEditor.selection.anchor.line, previewEditor.selection.anchor.character)])
    await View.setFocusOnEditorColumn(previousColumnActive)
}

export function runCurrentMacro() {
    console.log('running macro')
    evalFunctionExpression(currentMacroScript)
}


export async function runMacro() {
    const existingMacros = await MacroRepository.getMacroNames()
    const options:View.QuickPickActionable[] = existingMacros.map(macroName => {
        return View.makeOption({label:macroName, final:true, description:'run macro'})
    })
    options.unshift({label:'Create Macro...', description:'start editing a new macro', final: true, value:'create'})
    const selectedItem = await View.promptOptions(options)
    if (!selectedItem) return 

    if (selectedItem.value === 'create') {
        openMacroEditor()
    } else {
        currentMacroScript = (await MacroRepository.fetchMacro(selectedItem.label)).content
        runCurrentMacro()
    }
    
}

export async function editMacro() {
    const existingMacros = await MacroRepository.getMacroNames()
    const options:View.QuickPickActionable[] = existingMacros.map(macroName => {
        return View.makeOption({label:macroName, final:true, description:'edit macro'})
    })
    const selectedItem = await View.promptOptions(options)
    if (!selectedItem) return 

    currentMacroScript = (await MacroRepository.fetchMacro(selectedItem.label)).content
    openMacroEditor(currentMacroScript)
}

let watcher:View.DocumentWatcher

export async function openMacroEditor(defaultScript = DEFAULT_SCRIPT) {
    scriptEditor = await View.openShowDocument('New Macro Script.macro', defaultScript, false, 2)
    const previousFocusColumnNumber = vscode.window.activeTextEditor.viewColumn
    const sourceEditor              = View.visibleTextEditorByColumn(1)
    const sourceText                = sourceEditor.document.getText()
    const macroScript               = scriptEditor.document.getText()
    let   previewEditor             = await View.openShowDocument('Macro Preview.txt', sourceText, false, 3)
    const previewDocument           = previewEditor.document
    
    previewEditor.selection = sourceEditor.selection
    previewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(previewEditor.selection.anchor.line, previewEditor.selection.anchor.character)])
    View.setFocusOnEditorColumn(previousFocusColumnNumber)

    if (watcher) watcher.dispose() // disconnect any previous watcher
    watcher = View.watchDocument(scriptEditor.document, async event => {
        previewEditor = View.visibleTextEditorFromDocument(previewDocument)
        if (!previewEditor) return
        if (event.eventType === 'selection' && event.cursorMoved === 'vertical') {
            await previewEditor.edit(function (editBuilder) {
                editBuilder.replace(Region.makeRangeDocument(previewEditor.document), sourceText);
            }, {undoStopAfter:false, undoStopBefore:false});

            previewEditor.selection = sourceEditor.selection
            const scriptContent = Region.makeRangeFromStartToLine(scriptEditor.document, scriptEditor.selection.end.line)
            currentMacroScript = scriptEditor.document.getText(scriptContent)
            await evalFunctionExpressionAsPreview(currentMacroScript, previewEditor)
        }
    })
}

export async function saveScript() {
    const existingMacros = await MacroRepository.getMacroNames()
    const options:View.QuickPickActionable[] = existingMacros.map(macroName => {
        return View.makeOption({label:macroName, final:true, description:'macro'})
    })
    options.unshift({label:'create new...', description:'save new macro', final: true, input: {prompt:'enter name of new macro'}})
    View.promptOptions(options, (item, action) => {
        if (View.QuickPickActionType.ENTER === action) {
            MacroRepository.saveMacro(item.value || item.label, currentMacroScript)
        }
    })
}