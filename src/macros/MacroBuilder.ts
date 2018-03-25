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

async function moveLineDown() {
    await vscode.commands.executeCommand('editor.action.moveLinesDownAction');
}

async function command(id:string, ...parameters:any[]) {
    parameters.splice(0,0,id);  // insert id at start of array
    await vscode.commands.executeCommand.apply(this, parameters)
}

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

function linesFromSourceDocument(document:vscode.TextDocument) {
    const editor = View.visibleTextEditorFromDocument(document)
    return Lines.linesFromRanges(document, editor.selections);
}

function linesFromDocument(document:vscode.TextDocument) {
    const editor = View.visibleTextEditorFromDocument(document)
    return Lines.linesFromRange(document, Region.makeRangeDocument(document)).map(line=>line.text)
}

function selectionsFromDocument(document:vscode.TextDocument) {
    const editor = View.visibleTextEditorFromDocument(document)
    return editor.selections.map(selection=>document.getText(selection))
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

export async function previewCurrentMacro() {
    scriptEditor = await View.openShowDocument('Macro Script.txt', DEFAULT_SCRIPT, false)
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

export async function openScript() {
    scriptEditor = await View.openShowDocument('Macro Script.txt', DEFAULT_SCRIPT, false)
}


