'use strict';
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'

const gutterDecorationType = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

function linesFromRangesExpandBlockIfEmpty(textEditor: vscode.TextEditor,ranges: Array<vscode.Range>) {
    if(ranges.length === 1) {
        ranges[0] = edit.expandRangeToBlockIfEmpty(textEditor, ranges[0]);
    }
    return edit.linesFromRanges(textEditor.document, ranges);
}

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if (ranges.length === 1 && !ranges[0].isSingleLine) edit.sortLinesWithinRange(textEditor,  ranges[0]);
    else {
        ranges = edit.makeVerticalRangesWithinBlock(textEditor, ranges);
        textEditor.selections = edit.makeSelectionsFromRanges(ranges);
        edit.sortLinesByColumn(textEditor, ranges);
    } 
}
export function sortLinesByLength(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const linesToSort = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    edit.sortLinesByLength(textEditor, linesToSort);
}

export function uniqueLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if(ranges.length === 1) {
        const rangeBlock = edit.expandRangeToBlockIfEmpty(textEditor, ranges[0]);
        const lines = edit.linesFromRange(textEditor.document, rangeBlock);
        const uniqueMep = new Map()
        lines.forEach(line => {
            uniqueMep.set(line.text, line);
        });

        const uniqueLines = uniqueMep.values()
        const linesArray = Array.from(uniqueLines);
        edit.replace(textEditor, rangeBlock, edit.textFromLines(textEditor.document, linesArray));
    }
}

export function uniqueLinesToNewDocument(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const uniqueMap = new Map()
    lines.forEach(line => {
        uniqueMap.set(line.text, line);
    });

    const uniqueLines = uniqueMap.values()
    const linesArray = Array.from(uniqueLines);
    edit.openShowDocument(edit.textFromLines(textEditor.document, linesArray));
}

export function filterLines(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = edit.textOfLineSelectionOrWordAtCursor(textEditor.document, selection);
    // If we have multiple lines selected, use that as source to filter, else the entire document
    const range = selection.isSingleLine ? edit.makeRangeDocument(textEditor) : selection;

    let filteredLines = [];
    return edit.promptForFilterExpression(selectedText)
        .then(fnFilter => {
            filteredLines = edit.filterLines(textEditor, range, fnFilter);
            const content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
            edit.replace(textEditor, range, content);
        })
}

export function filterLinesToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = edit.textOfLineSelectionOrWordAtCursor(textEditor.document, selection);
    // If we have multiple lines selected, use that as source to filter, else the entire document
    const range = selection.isSingleLine ? edit.makeRangeDocument(textEditor) : selection;

    let filteredLines = [];
    return edit.promptForFilterExpression(selectedText)
        .then(fnFilter => {
            filteredLines = edit.filterLines(textEditor, range, fnFilter);
            const content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
            return edit.openShowDocument(content)
        })
        .then(editor => {
            const decorations = filteredLines.map((line, index) => edit.createGutterDecorator(index, ': ' + (line.lineNumber + 1), '50px'));
            editor.setDecorations(gutterDecorationType, decorations);
            return editor;
        });
}

export function alignToCursor(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    ranges = edit.makeVerticalRangesWithinBlock(textEditor, ranges);
    textEditor.selections = edit.makeSelectionsFromRanges(ranges);
    const lineInfos = edit.makeLineInfos(textEditor, ranges);
    textEditor.edit(function (editBuilder) {
        lineInfos.forEach(line => {
            const lineLeftOfCursor = line.line.text.substring(0, line.range.start.character);
            const trimmedRight = line.line.text.substring(line.range.start.character).trim();

            editBuilder.replace(edit.expandRangeFullLineWidth(textEditor.document, line.range), lineLeftOfCursor + trimmedRight );
        });
    })
}

export function alignCSV(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const linesParts = lines.map(line=>line.text.split(','));
    const newLineTexts:string[] = []
    const linePartCount = linesParts[0].length;
    for (let partIndex = 0; partIndex < linePartCount; partIndex++) {
        const max = maxLength(linesParts, 0);
        appendNewLines(newLineTexts, linesParts, max);
    }

    edit.replaceLinesWithText(textEditor, lines, newLineTexts);
}

function appendNewLines(lines:string[], linesParts:string[][], max:number) {
    for (let linePartIndex = 0; linePartIndex < linesParts.length; linePartIndex++) {
        const part = padRight(linesParts[linePartIndex].shift(), max);
        
        if (lines[linePartIndex] == undefined) lines[linePartIndex] = '';
        lines[linePartIndex] += part;
    }
}

function padRight(text:string, count:number) {
    const padAmount = count - text.length;
    return text + ' '.repeat(padAmount+1);
}

function maxLength(texts:string[][], partIndex:number) {
    let max = 0;
    return texts.map(text=>text[partIndex].length).reduce((prev, curr)=>{
        return curr>=prev?curr:prev;
    })
}