'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { Region,Lines,Modify,View } from 'vscode-extension-common';
import * as MacroRepository from './MacroRepository'

const DEFAULT_SCRIPT = "// write macro\n" +
                       "\n" +
                       "\n"

const cursorDecorationType = View.createCursorDecoratorType()

async function moveLineDown() {
    await vscode.commands.executeCommand('editor.action.moveLinesDownAction');
}

async function command(id:string, ...parameters:any[]) {
    parameters.splice(0,0,id);  // insert id at start of array
    await vscode.commands.executeCommand.apply(this, parameters)
}

async function evalFunctionExpression(expression:string) {
    const preExpression = `async function run() {
        await vscode.commands.executeCommand('workbench.action.focusThirdEditorGroup')`
    const postExpression = `
    }
    run();
    `
    
    expression = expression.replace(new RegExp('command\\(', 'g'), 'await command(')
    //expression = expression.replace('command(', 'await command(')
    expression = preExpression + expression + postExpression
    try {
         await eval(expression)
    } catch {
        console.log('unable to evaluate', expression)
    }
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

let queue = []

export async function documentToDocumentTransform(update:View.LiveViewUpdater, event:View.LiveDocumentViewEvent) {
    if (event.eventOrigin === 'script' && event.scriptCursorMoved === 'horizontal') return 
    if (event.eventOrigin === 'script' && event.eventType === 'edit') return

    const previousFocusColumnNumber = vscode.window.activeTextEditor.viewColumn

    const targetDocument = event.viewEditor.document;
    await Promise.all(queue)
    return update(event.viewEditor, Region.makeRangeDocument(targetDocument), event.sourceEditor.document.getText())
    .then(async ()=> {
            await Promise.all(queue)
            event.viewEditor.selection = event.sourceEditor.selection
            const scriptDocument = event.scriptEditor.document
            const scriptContent = Region.makeRangeFromStartToLine(scriptDocument, event.scriptEditor.selection.end.line)
            queue = []
            queue.push(evalFunctionExpression(event.scriptEditor.document.getText(scriptContent))
                .then(()=>{
                    event.viewEditor.setDecorations(cursorDecorationType, [View.createCursorDecorator(event.viewEditor.selection.anchor.line, event.viewEditor.selection.anchor.character)])
                    return vscode.commands.executeCommand(commandIdForColumnFocus(previousFocusColumnNumber))
                    //vscode.window.activeTextEditor = previousActiveEditor
                }))
        });
}

export function liveDocumentView() {
    console.log(MacroRepository.resolveMacroFileLocation())
    return View.liveDocumentView('Live-Transform.txt', DEFAULT_SCRIPT, edit.debounce(documentToDocumentTransform, 300))
}
