'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { Region,Lines,Modify,View,Application } from 'vscode-extension-common';
import * as MacroRepository from './MacroRepository'
import * as MacroExpression from './MacroExpression'
import * as ExtendedCommands from './ExtendedCommands'

const DEFAULT_SCRIPT = "// - This Feature is BETA, scripts may not work in future versions\n" +
                       "// - macro commands:\n" +
                       "//   t - \"text to type\"\n" +
                       "//   c - cursor commands\n" +
                       "//   s - selection commands\n" +
                       "//   v - all vscode commands\n" +
                       "//   x - macro script helper commands\n" +
                       "\n"

const cursorDecorationType = View.createCursorDecoratorType()
let currentMacroScript:MacroRepository.MacroScript
let currentMacroScriptContentLastSave
let scriptWatcher:View.DocumentWatcher
let previewText = ''
let previewSelections
let scriptDocument:vscode.TextDocument
let previewDocument:vscode.TextDocument

const codeLensChangeEvent = new vscode.EventEmitter<void>()
vscode.languages.registerCodeLensProvider({language:'plaintext' }, {
    provideCodeLenses: (document, cancel) => {
        if (document !== previewDocument) return
        return [View.makeCodeLens('Set current text as starting point for macro test', 0,0, updatePreviewTextInitialState)]
    },
    onDidChangeCodeLenses: codeLensChangeEvent.event
})
vscode.languages.registerCodeLensProvider({language:'macro' }, {
    provideCodeLenses: (document, cancel) => {
        if (currentMacroScript.content === currentMacroScriptContentLastSave) return

        const name = currentMacroScript.name ? currentMacroScript.name : ''
        return [View.makeCodeLens('Save Script: ' + name, 0,0, saveScript)]
    },
    onDidChangeCodeLenses: codeLensChangeEvent.event
})

async function evalFunctionExpression(expression:string) {
    const macroExpression = MacroExpression.parseScript(expression)
    for (const command of macroExpression.commands) {
        if (command.type === MacroExpression.CommandType.VSCODE_COMMAND) {
            const parameters = [command.command].concat(command.parameters)
            await vscode.commands.executeCommand.apply(this, parameters)
        }
        if (command.type === MacroExpression.CommandType.EXTENDED_COMMAND) {
            ExtendedCommands.executeCommand(command.command, vscode.window.activeTextEditor, command.parameters[0])
        }
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

async function pickMacro():Promise<void|View.QuickPickActionable> {
    const existingMacros = await MacroRepository.getMacroNames()
    const options:View.QuickPickActionable[] = existingMacros.map(macroName => {
        return View.makeOption({label:macroName, final:true, description:''})
    })
    const selectedItem = await View.promptOptions(options)
    return selectedItem
}

export function runCurrentMacro() {
    evalFunctionExpression(currentMacroScript.content)
}

export async function createMacro() {
    // TODO set default preview text with current selection if exists
    
    const selectedText = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection)
    if (selectedText) previewText = selectedText
    else previewText = ''
    currentMacroScript = {content:DEFAULT_SCRIPT, name:null}
    openMacroEditor()
}

export async function runMacro() {
    const selectedItem = await pickMacro()
    if (!selectedItem) return 

    currentMacroScript = (await MacroRepository.fetchMacro(selectedItem.label))
    runCurrentMacro()
}

export async function deleteMacro() {
    const selectedItem = await pickMacro()
    if (!selectedItem) return 

    const answer = await vscode.window.showWarningMessage('Delete Macro: ' + selectedItem.label, 'Delete', 'Cancel')
    if (answer === 'Delete')
        await MacroRepository.deleteMacro(selectedItem.label)
}

export async function editMacro() {
    const selectedItem = await pickMacro()
    if (!selectedItem) return 

    currentMacroScript = (await MacroRepository.fetchMacro(selectedItem.label))
    currentMacroScriptContentLastSave = currentMacroScript.content
    await openMacroEditor()
}

async function openMacroEditor() {
    let scriptEditor                = await View.openShowDocument('Macro Script Editor.macro', currentMacroScript.content, false, 2)
    scriptDocument                  = scriptEditor.document
    const previousFocusColumnNumber = vscode.window.activeTextEditor.viewColumn
    const macroScript               = scriptEditor.document.getText()
    let   previewEditor             = await View.openShowDocument('Macro Preview.txt', previewText, false, 3)
    previewDocument                 = previewEditor.document
    previewSelections               = previewEditor.selections

    previewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(previewEditor.selection.anchor.line, previewEditor.selection.anchor.character)])
    View.setFocusOnEditorColumn(previousFocusColumnNumber)

    if (scriptWatcher) scriptWatcher.dispose() // disconnect any previous watcher
    scriptWatcher = View.watchDocument(scriptEditor.document, async event => {
        // Editors can change if document is moved to different view column
        // Need to get the current editors
        previewEditor = View.visibleTextEditorFromDocument(previewDocument)
        scriptEditor = View.visibleTextEditorFromDocument(scriptDocument)
        currentMacroScript.content = scriptEditor.document.getText()
        if (!previewEditor) return

        if (event.eventType === 'selection' && event.cursorMoved === 'vertical') {
            await previewEditor.edit(function (editBuilder) {
                editBuilder.replace(Region.makeRangeDocument(previewEditor.document), previewText);
            }, {undoStopAfter:false, undoStopBefore:false});
            
            previewEditor.selections = previewSelections
            const scriptContentRange = Region.makeRangeFromStartToLine(scriptEditor.document, scriptEditor.selection.end.line)
            const scriptUpToCursor = scriptEditor.document.getText(scriptContentRange)
            await evalFunctionExpressionAsPreview(scriptUpToCursor, previewEditor)
        }
    })
}

export function updatePreviewTextInitialState() {
    previewText = previewDocument.getText()
    previewSelections = View.visibleTextEditorFromDocument(previewDocument).selections
    const scriptEditor = View.visibleTextEditorFromDocument(scriptDocument)

    // switch focus back to script editor and position cursor on first line
    View.setFocusOnEditorColumn(scriptEditor.viewColumn)
    scriptEditor.selection = new vscode.Selection(0, 0, 0, 0)
}

async function saveScript() {
    if (currentMacroScript.name) {
        // update existing script
        MacroRepository.saveMacro(currentMacroScript.name, currentMacroScript.content)
        currentMacroScriptContentLastSave = currentMacroScript.content
        codeLensChangeEvent.fire()
        return
    }

    const existingMacros = await MacroRepository.getMacroNames()
    const macroName = await vscode.window.showInputBox({prompt:'Enter macro name'})
    if (!macroName) return
    const existingMacro = existingMacros.find(macro => macro === macroName)
    if (!existingMacro) {
        MacroRepository.saveMacro(macroName, currentMacroScript.content)
        currentMacroScript.name = macroName
        currentMacroScriptContentLastSave = currentMacroScript.content
        codeLensChangeEvent.fire()
    } else {
        vscode.window.showErrorMessage(macroName + ' already exists as a macro')
    }
}