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
        await vscode.commands.executeCommand(command.command)
    }   
}

async function evalFunctionExpressionAsPreview(expression:string, previewEditor:vscode.TextEditor) {
    const previousColumnActive = vscode.window.activeTextEditor.viewColumn
    await vscode.commands.executeCommand('workbench.action.focusThirdEditorGroup')
    await evalFunctionExpression(expression)
    previewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(previewEditor.selection.anchor.line, previewEditor.selection.anchor.character)])
    await vscode.commands.executeCommand(commandIdForColumnFocus(previousColumnActive))
}

function commandIdForColumnFocus(column:number) {
    switch (column) {
        case 1: return 'workbench.action.focusFirstEditorGroup'
        case 2: return 'workbench.action.focusSecondEditorGroup'
        case 3: return 'workbench.action.focusThirdEditorGroup'
    }
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

export async function openMacroEditor(defaultScript = DEFAULT_SCRIPT) {
    scriptEditor = await View.openShowDocument('New Macro Script.txt', defaultScript, false)
    const previousFocusColumnNumber = vscode.window.activeTextEditor.viewColumn
    const sourceEditor              = View.visibleTextEditorByColumn(1)
    const sourceText                = sourceEditor.document.getText()
    const macroScript               = scriptEditor.document.getText()
    const viewEditor                = await View.openShowDocument('Macro Preview.txt', sourceText, false)
    
    viewEditor.selection = sourceEditor.selection
    viewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(viewEditor.selection.anchor.line, viewEditor.selection.anchor.character)])
    vscode.commands.executeCommand(commandIdForColumnFocus(previousFocusColumnNumber))

    View.watchDocument(scriptEditor.document, async event => {
        if (event.eventType === 'selection' && event.cursorMoved === 'vertical') {
            await viewEditor.edit(function (editBuilder) {
                editBuilder.replace(Region.makeRangeDocument(viewEditor.document), sourceText);
            }, {undoStopAfter:false, undoStopBefore:false});

            viewEditor.selection = sourceEditor.selection
            const scriptContent = Region.makeRangeFromStartToLine(scriptEditor.document, scriptEditor.selection.end.line)
            currentMacroScript = scriptEditor.document.getText(scriptContent)
            await evalFunctionExpressionAsPreview(currentMacroScript, viewEditor)
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