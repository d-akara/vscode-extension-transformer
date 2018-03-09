'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { expandRangeFullLineWidth } from 'vscode-extension-common';

const DEFAULT_SCRIPT = "// write macro\n" +
                       "\n" +
                       "\n"

const cursorDecorationType = edit.createCursorDecoratorType()

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
    expression = expression.replace('command(', 'await command(')
    expression = preExpression + expression + postExpression
    try {
         await eval(expression)
    } catch {
        console.log('unable to evaluate', expression)
    }
}

function linesFromSourceDocument(document:vscode.TextDocument) {
    const editor = edit.visibleTextEditorFromDocument(document)
    return edit.linesFromRanges(document, editor.selections);
}

function linesFromDocument(document:vscode.TextDocument) {
    const editor = edit.visibleTextEditorFromDocument(document)
    return edit.linesFromRange(document, edit.makeRangeDocument(document)).map(line=>line.text)
}

function selectionsFromDocument(document:vscode.TextDocument) {
    const editor = edit.visibleTextEditorFromDocument(document)
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

export async function documentToDocumentTransform(update:edit.LiveViewUpdater, event:edit.LiveDocumentViewEvent) {
    if (event.eventOrigin === 'script' && event.scriptCursorMoved === 'horizontal') return 
    if (event.eventOrigin === 'script' && event.eventType === 'edit') return

    const previousFocusColumnNumber = vscode.window.activeTextEditor.viewColumn

    const targetDocument = event.viewEditor.document;
    await Promise.all(queue)
    return update(event.viewEditor, edit.makeRangeDocument(targetDocument), event.sourceEditor.document.getText())
    .then(async ()=> {
            await Promise.all(queue)
            event.viewEditor.selection = event.sourceEditor.selection
            const scriptDocument = event.scriptEditor.document
            const scriptContent = edit.makeRangeFromStartToLine(scriptDocument, event.scriptEditor.selection.end.line)
            queue = []
            queue.push(evalFunctionExpression(event.scriptEditor.document.getText(scriptContent))
                .then(()=>{
                    event.viewEditor.setDecorations(cursorDecorationType, [edit.createCursorDecorator(event.viewEditor.selection.anchor.line, event.viewEditor.selection.anchor.character)])
                    return vscode.commands.executeCommand(commandIdForColumnFocus(previousFocusColumnNumber))
                    //vscode.window.activeTextEditor = previousActiveEditor
                }))
        });
}

export function liveDocumentView() {
    return edit.liveDocumentView('Live-Transform.txt', DEFAULT_SCRIPT, edit.debounce(documentToDocumentTransform, 300))
}
