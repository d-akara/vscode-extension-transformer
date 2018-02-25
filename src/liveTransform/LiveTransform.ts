'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { expandRangeFullLineWidth } from 'vscode-extension-common';

const DEFAULT_SCRIPT = "// lines, selections, document\n" +
                       "FILTER:\n" +
                       "MAP:\n"

const CONTEXT_SEPARATOR = '------------------------------------------------------------------------'

function makeScriptRange(document:vscode.TextDocument) {
    const lines = edit.linesFromRange(document, edit.makeRangeDocument(document))
    const separatorLine = lines.find(line=>line.text===CONTEXT_SEPARATOR).lineNumber
    return new vscode.Range(new vscode.Position(0,0), new vscode.Position(separatorLine, 0))
}

function makeOutputRange(document:vscode.TextDocument) {
    const lines = edit.linesFromRange(document, edit.makeRangeDocument(document))
    const separatorLine = lines.find(line=>line.text===CONTEXT_SEPARATOR).lineNumber
    return edit.makeRangeFromLineToEnd(document, separatorLine + 1)
}

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
    //console.log(event.eventType, event.sourceDocument.fileName, event.sourceOfEventIsView)
    const targetDocument = event.viewEditor.document;
    const scriptRange = makeScriptRange(targetDocument)
    const outputRange = makeOutputRange(targetDocument)
    //if (event.eventType === 'edit')
        update(event.viewEditor, outputRange, event.sourceDocument.getText(edit.makeRangeDocument(event.sourceDocument)))
}


export function liveDocumentView() {
    let lastActiveSourceDocument = vscode.window.activeTextEditor.document
    return edit.liveDocumentView('Live-Transform.txt', DEFAULT_SCRIPT + CONTEXT_SEPARATOR + '\n', documentToDocumentTransform)
   
}
