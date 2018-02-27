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

function evalFunctionExpression(expression:string):Function {
    const expressionFn = '(line, regex)=>`' + expression + '`'
    return eval(expressionFn)

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
    update(event.viewEditor, edit.makeRangeDocument(targetDocument), event.sourceEditor.document.getText(edit.makeRangeDocument(event.sourceEditor.document)))
        .then(()=>event.viewEditor.selection = event.sourceEditor.selection)
}

export function liveDocumentView() {
    return edit.liveDocumentView('Live-Transform.txt', DEFAULT_SCRIPT, documentToDocumentTransform)
}
