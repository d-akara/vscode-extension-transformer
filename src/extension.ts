'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';

let orderby = require('lodash.orderby');

/**
 * TODO - planned features:
 * - Snap/Align to vertical cursor line
 * - Sort by column.  Determined by vertical cursor line
 * - Sort.  Determined by selection
 * - Filter all lines of file to a new editor window
 * - Filter within selection
 * - unique lines
 * - trim lines
 * - reverse lines
 * - split/join lines using token or expression
 * - Live realtime filtering view. click on filtered lines to jump to location.  Line numbers with filtered content
 * - Power selections
 *  - all lines containing...
 *  - remove selections containing...
 *  - all lines with same level
 *  - copy selections to new editor
 * - snippet transormation
 * 
 * @param context 
 */

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('dakara-transformer.sortLines', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLines(textEditor, selections);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('dakara-transformer.filter', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        transforms.filterLinesToNewDocument(textEditor, selection);
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}