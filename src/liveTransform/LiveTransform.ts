'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'

const DEFAULT_SCRIPT = "// lines, selections, document\n" +
                       "lines.filter(line=>/./i.test(line))\n" +
                       "     .map(line=>line)\n"

const FILTER_SEPARATOR = '------------------------------------------------------------------------'


function filterRange(document:vscode.TextDocument) {
    const lines = edit.linesFromRange(document, edit.makeRangeDocument(document))
    const separatorLine = lines.find(line=>line.text===FILTER_SEPARATOR).lineNumber
    return new vscode.Range(new vscode.Position(0,0), new vscode.Position(separatorLine, 0))
}

function extractFilterFromDocument(document:vscode.TextDocument) {
    const range = filterRange(document)
    const filterText = document.getText(filterRange(document)).trim()
    return {filterText, separatorLine: range.end.line + 1}
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

function filterDocument(textDocument, filter:string) {
    //if (typeof filterFn !== "function") return ''
    const lines = linesFromSourceDocument(textDocument).map(line=>line.text)
    const document = linesFromDocument(textDocument)
    const selections = selectionsFromDocument(textDocument)
    //const filterFn = eval(filter)
    let result = ''
    try {
        result = eval(filter).reduce((prev, curr) => prev + '\n' + curr, '')
    } catch (error) {
        result = error.message
    }
    
    return result;
    // return edit.filterLines(document, edit.makeRangeDocument(document), filterFn)
    //     .map(line => line.text)
    //     .reduce((prev, curr) => prev + '\n' + curr, '')
}

function documentToDocumentTransform(sourceDocument:vscode.TextDocument, targetDocument:vscode.TextDocument) {
    const targetEditor:vscode.TextEditor = edit.visibleTextEditorFromDocument(targetDocument)
    if (!targetEditor) return
    const {filterText, separatorLine} = extractFilterFromDocument(targetDocument)
    const allAfterFirstLine = edit.makeRangeFromLineToEnd(targetDocument, separatorLine)
    edit.replace(targetEditor, allAfterFirstLine, filterDocument(sourceDocument, filterText))
    // reset selection.  Otherwise all replaced text is highlighted in selection
    //targetEditor.selection = new vscode.Selection(new vscode.Position(0,0), new vscode.Position(0,0))
}

export function liveTransform(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    let lastActiveSourceDocument = vscode.window.activeTextEditor.document
    return edit.openShowDocument('Live-Transform.txt', DEFAULT_SCRIPT + FILTER_SEPARATOR + '\n', false)
        .then(editor => {
            // reset selection.  Otherwise all replaced text is highlighted in selection
            editor.selection = new vscode.Selection(new vscode.Position(1,21), new vscode.Position(1,21))

            const targetDocument = editor.document
            vscode.workspace.onDidChangeTextDocument(event=> {
                if (event.document === targetDocument && !filterRange(targetDocument).contains(event.contentChanges[0].range)) return
                documentToDocumentTransform(lastActiveSourceDocument, targetDocument)
            })
            vscode.window.onDidChangeTextEditorSelection(event=> {
                if (event.textEditor.document === targetDocument) return
                documentToDocumentTransform(lastActiveSourceDocument, targetDocument)
            })            
            vscode.window.onDidChangeActiveTextEditor(event=> {
                // when switching documents a selection change event is also sent most of the time
                // if we update the document on this event, the selections will be wrong
                // TODO - need to investigate work arounds to make the behavior more reliable
                // but we are impared by vscodes unreliable behavior in this case
                if (event.document !== targetDocument)
                    lastActiveSourceDocument = event.document
            })
            return editor;
        });
}