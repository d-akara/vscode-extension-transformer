'use strict';
import * as vscode from 'vscode';
import * as transforms from './Transforms';

let orderby = require('lodash.orderby');

/**
 * TODO - planned features:
 * - Snap/Align to vertical cursor line
 * - Sort by column.  Determined by vertical cursor line
 * - Multi column sort.  Can we determine cursor selection order?
 * - Sort.  Determined by selection
 * - Filter all lines of file to a new editor window
 * - Live realtime filtering view
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

    vscode.commands.registerCommand('dakara-transformer.sortLinesByColumn', () => {
        const textEditor = vscode.window.activeTextEditor;
        const selections = textEditor.selections;
        transforms.sortLinesByColumn(textEditor, selections);
    });
    context.subscriptions.push(disposable);

}

export function deactivate() {
}