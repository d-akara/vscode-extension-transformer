'use strict';
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if (ranges.length === 1) edit.sortLinesWithinRange(textEditor, edit.expandRangeDocumentIfEmpty(textEditor, ranges[0]));
    else edit.sortLinesByColumn(textEditor, ranges);
}

export function filterLinesToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = edit.textOfSelectionOrWordAtCursor(textEditor.document, selection);
    
    const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
        cursor: 'crosshair',
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    let filteredLines = [];
    return vscode.window.showInputBox({value: selectedText, prompt: 'Enter regex or [space] + literal'})
    .then(filter => {
        let fnFilter;
        if (filter.charAt(0) === ' ') fnFilter = (lineText:string) => lineText.includes(filter.substring(1));
        else {
            const regex = new RegExp(filter);
            fnFilter = (lineText:string) => regex.test(lineText);
        }
        filteredLines = edit.filterLines(textEditor, fnFilter);
        const content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
        return vscode.workspace.openTextDocument({ 'language': textEditor.document.languageId, 'content': content });
    })
    .then(document => {
        return vscode.window.showTextDocument(document, vscode.ViewColumn.Two, false);
    })
    .then(editor => {
        const decorations = [];
        filteredLines.forEach((line, index) => {
            const posStart = new vscode.Position(index,0);
            decorations.push({
                range: new vscode.Range(posStart, posStart), 
                renderOptions: {
                    before: {contentText: 'line: ' + (line.lineNumber + 1), width: '100px', backgroundColor: 'rgba(50,50,100, 0.5)', color: 'rgba(100,100,100, .5)'} 
                }
            });
        });
        editor.setDecorations(largeNumberDecorationType, decorations);
        return editor.document;
    });
}

export function alignColumns(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    //if (ranges.length === 1) autoAlign(textEditor, ranges[0]);
    const lineInfos = edit.makeLineInfos(textEditor, ranges);
    textEditor.edit(function (editBuilder) {
        lineInfos.forEach(line => {
            const lineLeftOfCursor = line.line.text.substring(0, line.range.start.character);
            const trimmedRight = line.line.text.substring(line.range.start.character).trim();

            editBuilder.replace(edit.expandRangeFullLineWidth(textEditor.document, line.range), lineLeftOfCursor + trimmedRight );
        });
    })
}