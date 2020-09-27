'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';
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
 */

interface LinkedDocument {
    source: vscode.TextDocument;
    target: vscode.TextDocument;
} 

export function activate(context: vscode.ExtensionContext) {
    let disposable;

    disposable = vscode.commands.registerCommand('dakara-transformer.sortLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLines(textEditor, selections);
    });

    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('dakara-transformer.reverseLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        Modify.reverseLines(textEditor, selections);
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

    disposable = vscode.commands.registerCommand('dakara-transformer.randomLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.randomizeLines(textEditor, selection);
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

    disposable = vscode.commands.registerCommand('dakara-transformer.macroRepeat', () => {
        transforms.macroRepeatLast()
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.macroCreate', () => {
        transforms.macroCreate()
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.macroDelete', () => {
        transforms.macroDelete()
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.macroRun', () => {
        transforms.macroRun()
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.macroEdit', () => {
        transforms.macroEdit()
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-internal.oncommand', onCommand => onCommand());
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


}

export function deactivate() {
}