'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';
import Alignment from './Alignment';
import {Modify, View, Application} from 'vscode-extension-common'
/**
 * TODO - planned features:
 * - unique selections as new document
 * - filter sections based on text found in levels to the right
 * - trim identical parts of lines
 * - sort folding regions / sort sections as determined by each cursor location
 * - split/join lines using token or expression
 * - Live realtime filtering view. click on filtered lines to jump to location.  Line numbers with filtered content
 *  - combined live filter from all open documents.
 * - Power selections
 *  - all lines containing...
 *  - remove selections containing...
 *  - all lines with same level
 *  - expand selection that can work with multiple cursors
 *  - select all highlighted (there is a vscode keybinding, but no command in palette)
 * - wrap at designated length
 * - constrain/transform selected text to certain chars.  Specify valid chars like a-z.  All other chars will be transformed to specified char.
 * - live preview hovers or such on some transforms when only 1 line selected
 * - filter lines as new document with line numbers of original as text in document
 * - https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * - JSON Where - https://www.npmjs.com/package/json-where
 *   - popup how to use from quick pick button
 * - XPath filtering using - https://github.com/FontoXML/fontoxpath
 * - constrain - limit all chars within a regex, all chars outside substituted with specified chars. also limit to lower case or uppercase.  possibly combine with remove accents.
 */

interface LinkedDocument {
    source: vscode.TextDocument;
    target: vscode.TextDocument;
} 

export function activate(context: vscode.ExtensionContext) {
    const alignment = new Alignment();
    let disposable;

    disposable = vscode.commands.registerCommand('dakara-transformer.alignAll', () => {
        // The code you place here will be executed every time your command is executed
        alignment.align();
    });

    disposable = vscode.commands.registerCommand('dakara-transformer.alignFirst', () => {
        // The code you place here will be executed every time your command is executed
        alignment.align(true);
    });

    disposable = vscode.commands.registerCommand('dakara-transformer.alignWhitespace', () => {
        // The code you place here will be executed every time your command is executed
        alignment.alignWhitespace();
    });

    disposable = vscode.commands.registerCommand('dakara-transformer.sortLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLines(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.sortSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortSelections(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.reverseLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        Modify.reverseLines(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.reverseSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.reverseSelections(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.uniqueLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.uniqueLines(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.uniqueLinesNewDocument', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.uniqueLinesToNewDocument(textEditor, selections);
    });
    context.subscriptions.push(disposable);
    
    disposable = vscode.commands.registerCommand('dakara-transformer.countUniqueLinesNewDocument', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.countUniqueLinesToNewDocument(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.sortByLineLength', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLinesByLength(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.trimLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.trimLines(textEditor, selections);
    });
    context.subscriptions.push(disposable)

    disposable = vscode.commands.registerCommand('dakara-transformer.trimSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.trimSelections(textEditor, selections);
    });
    context.subscriptions.push(disposable)

    disposable = vscode.commands.registerCommand('dakara-transformer.randomLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.randomizeLines(textEditor, selection);
    });
    context.subscriptions.push(disposable)

    disposable = vscode.commands.registerCommand('dakara-transformer.randomSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.randomizeSelections(textEditor, selections);
    });
    context.subscriptions.push(disposable)
    
    disposable = vscode.commands.registerCommand('dakara-transformer.filter', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.filterLines(textEditor, selection)
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.filterAsNewDocument', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.filterLinesWithContextToNewDocument(textEditor, selection)
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-internal.command', onCommand => onCommand());
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.alignCursor', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.alignToCursor(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.alignCSV', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.alignCSV(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.compactCSV', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.compactCSV(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.commands', () => {
        const textEditor = vscode.window.activeTextEditor;
        const commands = vscode.commands.getCommands().then(commandList => {
            const content = commandList.reduce((prev, curr) => prev + '\n' + curr);
            return View.openShowDocument('untitled:commands.txt', content);
        })
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.copyToNewDocument', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.copyToNewDocument(textEditor);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.selectLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.selectLines(textEditor);
    });
    context.subscriptions.push(disposable);

    Application.registerCommand(context, 'dakara-transformer.selectHighlights', () => {
        transforms.selectHighlights();
    });

    disposable = vscode.commands.registerCommand('dakara-transformer.linesAsJSON', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.linesAsJSON(textEditor);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.selectionAsJSON', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.selectionAsJSON(textEditor);
    });
    context.subscriptions.push(disposable);

    Application.registerCommand(context, 'dakara-transformer.JsonAsText', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.jsonStringAsText(textEditor);
    });

    disposable = vscode.commands.registerCommand('dakara-transformer.escapes', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.escapes(textEditor)
    });
    context.subscriptions.push(disposable);

    Application.registerCommand(context, 'dakara-transformer.joinLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.joinLines(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.splitLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.splitLines(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.splitLinesBeforeDelimiter', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.splitLinesBeforeDelimiter(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.splitLinesAfterDelimiter', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.splitLinesAfterDelimiter(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.rotateForwardSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.rotateForwardSelections(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.rotateBackwardSelections', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.rotateBackwardSelections(textEditor);
    });

    Application.registerCommand(context, 'dakara-transformer.normalizeDiacriticalMarks', () => {
        const textEditor = vscode.window.activeTextEditor;
        transforms.normalizeDiacriticalMarks(textEditor);
    });


}

export function deactivate() {
}