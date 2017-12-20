'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';
import * as edit from 'vscode-extension-common'
/**
 * TODO - planned features:
 * - Snap/Align to vertical cursor line
 * - Filter all lines of file to a new editor window
 * - Filter blocks to new document
 * - Filter within selection
 * - unique lines
 * - unique lines containing filter
 * - trim lines
 * - sort folding regions / sort sections as determined by each cursor location
 * - sort lines by length
 * - split/join lines using token or expression
 * - Live realtime filtering view. click on filtered lines to jump to location.  Line numbers with filtered content
 *  - combined live filter from all open documents.
 * - Power selections
 *  - all lines containing...
 *  - remove selections containing...
 *  - all lines with same level
 *  - copy selections to new editor
 * - snippet transformation
 * - scrapbook transformations
 */

interface LinkedDocument {
    source: vscode.TextDocument;
    target: vscode.TextDocument;
} 

export function activate(context: vscode.ExtensionContext) {
    const linkedDocuments= new Array<LinkedDocument>();
    let disposable = vscode.languages.registerDefinitionProvider({scheme: 'untitled'}, {
        provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
            const linkedDocument = linkedDocuments.find(linkedDocument => linkedDocument.target == linkedDocument.target);
            //vscode.window.showTextDocument(linkedDocument.source.uri);
            return new vscode.Location(linkedDocument.source.uri,  position);
        }
    }); 
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.sortLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLines(textEditor, selections);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('dakara-transformer.reverseLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        edit.reverseLines(textEditor, selections);
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
        transforms.uniqueLinesNewDocument(textEditor, selections);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('dakara-transformer.filter', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.filterLinesToNewDocument(textEditor, selection)
            .then(untitledDocument => linkedDocuments.push({source:textEditor.document, target:untitledDocument.document}));
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.align', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.alignColumns(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.commands', () => {
        const textEditor = vscode.window.activeTextEditor;
        const commands = vscode.commands.getCommands().then(commandList => {
            const content = commandList.reduce((prev, curr) => prev + '\n' + curr);
            return edit.openDocumentWith(content);
        })
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}