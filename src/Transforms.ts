'use strict';
import * as vscode from 'vscode';

let orderby = require('lodash.orderby');

interface lineInfo {
    line: vscode.TextLine;
    cursorIndex: number;
    cursorText: string;
}

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = linesFromRanges(textEditor.document, ranges);
    const sortedLines = orderby(lines, ['text']);

    replaceLines(textEditor, lines, sortedLines);
}

export function sortLinesByColumn(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = makeLineInfos(textEditor, ranges);
    
    const sortedLines = orderby(lines, [line => line.cursorText]);

    replaceLines(textEditor, lines.map(line => line.line), sortedLines.map(line => line.line));
    // TODO move cursors to new line positions
}

function makeLineInfos(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lineAndCursors: Map<number, lineInfo> = new Map();
    for(const range of ranges) {
        const line = textEditor.document.lineAt(range.start.line);
        let lineAndCursor = lineAndCursors.get(line.lineNumber);
        if (!lineAndCursor) lineAndCursor = {line:line, cursorIndex: range.start.character, cursorText: line.text.substring(range.start.character, line.text.length)};

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

function collectLines(document: vscode.TextDocument, startLine: number, endLine: number): Array<vscode.TextLine> {
    const lines = [];
    for (let index = startLine; index <= endLine; index++) {
        lines.push(document.lineAt(index));
    }
    return lines;
}