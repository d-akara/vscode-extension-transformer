'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { expandRangeFullLineWidth } from 'vscode-extension-common';

const DEFAULT_SCRIPT = "// write macro\n" +
                       "\n" +
                       "\n"


function extractTextBetweenDelimeters(text:string, begin:string, end:string) {
    const beginIndex = text.search(begin) + begin.length;
    const endIndex = text.indexOf(end, beginIndex)
    return text.substring(beginIndex, endIndex)
}

async function moveLineDown() {
    await vscode.commands.executeCommand('workbench.action.focusThirdEditorGroup')
    await vscode.commands.executeCommand('editor.action.moveLinesDownAction');
}

function evalFunctionExpression(expression:string) {
    return eval(expression)
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


export function documentToDocumentTransform(update:edit.LiveViewUpdater, event:edit.LiveDocumentViewEvent) {
    console.log(event.eventType, event.eventOrigin)
    const targetDocument = event.viewEditor.document;
    //const transformed = evalFunctionExpression(event.scriptEditor.document.getText(), edit.linesFromRange(event.sourceEditor.document, edit.makeRangeDocument(event.sourceEditor.document)))
    update(event.viewEditor, edit.makeRangeDocument(targetDocument), event.sourceEditor.document.getText())
        .then(()=> {
            event.viewEditor.selection = event.sourceEditor.selection
            evalFunctionExpression(event.scriptEditor.document.getText())
        });
}

export function liveDocumentView() {
    return edit.liveDocumentView('Live-Transform.txt', DEFAULT_SCRIPT, documentToDocumentTransform)
}
