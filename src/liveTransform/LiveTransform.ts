'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'
import { expandRangeFullLineWidth } from 'vscode-extension-common';

const DEFAULT_SCRIPT = "// lines, selections, document\n" +
                       "FILTER:\n" +
                       "MAP:\n"

const FILTER_SEPARATOR = '------------------------------------------------------------------------'

interface TransformFilter {
    filter: RegExp
    map: Function
}

function filterRange(document:vscode.TextDocument) {
    const lines = edit.linesFromRange(document, edit.makeRangeDocument(document))
    const separatorLine = lines.find(line=>line.text===FILTER_SEPARATOR).lineNumber
    return new vscode.Range(new vscode.Position(0,0), new vscode.Position(separatorLine, 0))
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

function extractFilterFromDocument(document:vscode.TextDocument) {
    const range = filterRange(document)
    const filterText = document.getText(filterRange(document))
    const filter = extractTextBetweenDelimeters(filterText, 'FILTER:', '\r')
    const mapExpression = extractTextBetweenDelimeters(filterText, 'MAP:', '\r')
    const mapFn = evalFunctionExpression(mapExpression)
    return {transformFilter: {filter: new RegExp(filter), map: mapFn}, separatorLine: range.end.line + 1}
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

function filterDocument(textDocument, transformFilter:TransformFilter) {
    //if (typeof filterFn !== "function") return ''
    //const lines = linesFromSourceDocument(textDocument).map(line=>line.text)
    const document = linesFromDocument(textDocument)
                     .map(line=>transformFilter.filter.exec(line))
                     .filter(regex=>regex!=null)
                     .map(regex=>transformFilter.map(regex[0], regex))
    //const selections = selectionsFromDocument(textDocument)
    //const filterFn = eval(filter)
    let result = ''
    try {
        result = document.reduce((prev, curr) => prev + '\n' + curr, '')
    } catch (error) {
        result = error.message
    }
    
    return result;
    // return edit.filterLines(document, edit.makeRangeDocument(document), filterFn)
    //     .map(line => line.text)
    //     .reduce((prev, curr) => prev + '\n' + curr, '')
}
const token = {internal:false}
export function documentToDocumentTransform(event:edit.LiveDocumentViewEvent) {
    token.internal = true;
    console.log(event.eventType, event.sourceDocument.fileName, event.sourceOfEventIsView)
    const targetDocument = event.viewEditor.document;
    //const {transformFilter, separatorLine} = extractFilterFromDocument(targetDocument)
    //const allAfterFirstLine = edit.makeRangeFromLineToEnd(targetDocument, separatorLine)
    if (!event.sourceOfEventIsView)
        edit.replace(event.viewEditor, edit.makeRangeDocument(targetDocument), event.sourceDocument.getText(edit.makeRangeDocument(event.sourceDocument)))
    // reset selection.  Otherwise all replaced text is highlighted in selection
    //targetEditor.selection = new vscode.Selection(new vscode.Position(0,0), new vscode.Position(0,0))
}


export function liveDocumentView() {
    let lastActiveSourceDocument = vscode.window.activeTextEditor.document
    return edit.liveDocumentView(token, 'Live-Transform.txt', DEFAULT_SCRIPT + FILTER_SEPARATOR + '\n', filterRange, documentToDocumentTransform)
   
}
