'use strict';
import * as vscode from 'vscode';
import * as edit from 'vscode-extension-common'

const gutterDecorationType = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if (ranges.length === 1) edit.sortLinesWithinRange(textEditor, edit.expandRangeToBlockIfEmpty(textEditor, ranges[0]));
    else edit.sortLinesByColumn(textEditor, ranges);
}

export function filterLinesToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = edit.textOfSelectionOrWordAtCursor(textEditor.document, selection);

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
        .then(document => vscode.window.showTextDocument(document, vscode.ViewColumn.Two, false))
        .then(editor => {
            // TODO - don't apply annotations if too many lines
            const decorations = filteredLines.map((line, index) => edit.createGutterDecorator(index, ': ' + (line.lineNumber + 1), '50px'));
            editor.setDecorations(gutterDecorationType, decorations);
            return editor;
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