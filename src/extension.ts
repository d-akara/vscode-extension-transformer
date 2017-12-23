'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';
import * as edit from 'vscode-extension-common'
/**
 * TODO - planned features:
 * - Snap/Align to vertical cursor line
 * - Filter blocks to new document
 * - unique lines containing filter
 * - trim lines
 * - sort folding regions / sort sections as determined by each cursor location
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
    let disposable;

    const linkedDocuments= new Array<LinkedDocument>();
    // Attempt to link to original lines of source document
    // however, we don't have access to the decorations we create
    // we would have to maintain our own mapping.  That is a bit painful, may consider again later.
    //
    // disposable = vscode.languages.registerDefinitionProvider({scheme: 'untitled'}, {
    //     provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
    //         const linkedDocument = linkedDocuments.find(linkedDocument => linkedDocument.target === document);
    //         return new vscode.Location(linkedDocument.source.uri,  position);
    //     }
    // }); 
    // context.subscriptions.push(disposable);

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
        transforms.uniqueLinesToNewDocument(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.sortByLineLength', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLinesByLength(textEditor, selections);
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
        transforms.filterLinesToNewDocument(textEditor, selection)
            .then(untitledDocument => linkedDocuments.push({source:textEditor.document, target:untitledDocument.document}));
    });
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