'use strict';
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'

let orderby = require('lodash.orderby');

interface lineInfo {
    line: vscode.TextLine;
    range: vscode.Range;
}

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if (ranges.length === 1) sortLinesWithinRange(textEditor, ranges[0]);
    else sortLinesByColumn(textEditor, ranges);
}

export function filterLinesToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = edit.textOfSelectionOrWordAtCursor(textEditor.document, selection);
    
    vscode.window.showInputBox({value: selectedText, prompt: 'Enter filter text'})
    .then(filter => {
        const filteredLines = filterLines(textEditor, filter);
        const content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
            vscode.workspace.openTextDocument({ 'language': textEditor.document.languageId, 'content': content })
                .then(document => {
                    vscode.window.showTextDocument(document, vscode.ViewColumn.Two, false);
                }
            );
        });
}

function filterLines(textEditor: vscode.TextEditor, filter:string) {
    const filteredLines:Array<vscode.TextLine> = [];
    const totalLines = textEditor.document.lineCount;
    for(let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
        const line = textEditor.document.lineAt(lineIndex);
        if (line.text.indexOf(filter) > -1) {
            filteredLines.push(line);
        }
    }
    return filteredLines;
}

function sortLinesWithinRange(textEditor: vscode.TextEditor, range: vscode.Range) {
    const lines = linesFromRange(textEditor.document, range);
    const sortedLines = orderby(lines, ['text']);

    replaceLines(textEditor, lines, sortedLines);
}

function sortLinesByColumn(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = makeLineInfos(textEditor, ranges);
    
    const sortedLines = orderby(lines, [line => rangeOrCursorText(line.line.text, line.range)]);

    replaceLines(textEditor, lines.map(line => line.line), sortedLines.map(line => line.line));
    const updatedRanges = makeRangesFromCombined(textEditor, lines.map(line => line.range), sortedLines.map(line => line.range));
    textEditor.selections = updatedRanges.map(range => new vscode.Selection(range.start, range.end));
}



function rangeOrCursorText(text: string, range: vscode.Range) {
    if (range.isSingleLine && range.start.character === range.end.character)
        // select to end of line if range does not span characters
        return text.substring(range.start.character, text.length);
    return text.substring(range.start.character, range.end.character);
} 

function makeLineInfos(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lineAndCursors: Map<number, lineInfo> = new Map();
    for(const range of ranges) {
        const line = textEditor.document.lineAt(range.start.line);
        let lineAndCursor = lineAndCursors.get(line.lineNumber);
        if (!lineAndCursor) lineAndCursor = {line, range};

        lineAndCursors.set(line.lineNumber, lineAndCursor);
    }
    return Array.from(lineAndCursors.values());
}

function linesFromRanges(document: vscode.TextDocument, ranges: Array<vscode.Range>) {
    return ranges.map( range => linesFromRange(document, range) ).reduce( (acc, cur) => acc.concat(cur));
}

function linesFromRange(document: vscode.TextDocument, range: vscode.Range) {
    const startLine = range.start.line;
    const endLine = range.end.line;

    return collectLines(document, startLine, endLine);
}

function expandRangeFullLineWidth(document: vscode.TextDocument, range: vscode.Range) {
    return new vscode.Range(range.start.line, 0, range.end.line, document.lineAt(range.end.line).text.length);
}

function replace(textEditor: vscode.TextEditor, range: vscode.Range, blockText: string) {
    textEditor.edit(function (editBuilder) {
        editBuilder.replace(range, blockText);
    });
}

function replaceLines(textEditor: vscode.TextEditor, linesOld: Array<vscode.TextLine>, linesNew: Array<vscode.TextLine>) {
    textEditor.edit(function (editBuilder) {
        let lineIndex = 0;
        linesOld.forEach(line => {
            editBuilder.replace(line.range, linesNew[lineIndex].text );
            lineIndex++;
        });
    })
}

function makeRangesFromCombined(textEditor: vscode.TextEditor, rangesLinesSource: Array<vscode.Range>, rangesCharPosSource: Array<vscode.Range>) {
    const newRanges = [];
    let lineIndex = 0;
    rangesLinesSource.forEach(rangeLineSource => {
        const ranchCharSource = rangesCharPosSource[lineIndex];
        newRanges.push(new vscode.Range(new vscode.Position(rangeLineSource.start.line, ranchCharSource.start.character), new vscode.Position(rangeLineSource.end.line, ranchCharSource.end.character)));
        lineIndex++;
    });

    return newRanges;
}

function collectLines(document: vscode.TextDocument, startLine: number, endLine: number): Array<vscode.TextLine> {
    const lines = [];
    for (let index = startLine; index <= endLine; index++) {
        lines.push(document.lineAt(index));
    }
    return lines;
}