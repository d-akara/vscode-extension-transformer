'use strict';
import * as path from 'path'
import * as vscode from 'vscode';
import {Lines,Modify,Region,View} from 'vscode-extension-common'
import * as MacroBuilder from './macros/MacroBuilder'
import * as MacroRepository from './macros/MacroRepository'
import { userInfo } from 'os';

const gutterDecorationType = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

function originName(textEditor: vscode.TextEditor) {
    const filename = textEditor.document.fileName
    return 'transform-' + path.basename(filename)
}

function linesFromRangesExpandBlockIfEmpty(textEditor: vscode.TextEditor,ranges: Array<vscode.Range>) {
    if(ranges.length === 1) {
        ranges[0] = Region.expandRangeToBlockIfEmpty(textEditor, ranges[0]);
    }
    return Lines.linesFromRanges(textEditor.document, ranges);
}

export function sortLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if (ranges.length === 1 && !ranges[0].isSingleLine) Modify.sortLinesWithinRange(textEditor,  ranges[0]);
    else {
        ranges = Region.makeVerticalRangesWithinBlock(textEditor, ranges);
        textEditor.selections = Region.makeSelectionsFromRanges(ranges);
        Modify.sortLinesByColumn(textEditor, ranges);
    } 
}
export function sortLinesByLength(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const linesToSort = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    Modify.sortLinesByLength(textEditor, linesToSort);
}
export function trimLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    let trimmedResult = "";
    const trimLinesB = Lines.linesFromRange(textEditor.document, ranges[0])
   for(const line of trimLinesB) {
       trimmedResult += line.text.trim() + '\n'
   }
   Modify.replace(textEditor,ranges[0],trimmedResult)
}
export function uniqueLines(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    if(ranges.length === 1) {
        const rangeBlock = Region.expandRangeToBlockIfEmpty(textEditor, ranges[0]);
        const lines = Lines.linesFromRange(textEditor.document, rangeBlock);
        const uniqueMep = new Map()
        lines.forEach(line => {
            uniqueMep.set(line.text, line);
        });

        const uniqueLines = uniqueMep.values()
        const linesArray = Array.from(uniqueLines);
        Modify.replace(textEditor, rangeBlock, Lines.textFromLines(textEditor.document, linesArray));
    }
}

export function uniqueLinesToNewDocument(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const uniqueMap = new Map()
    lines.forEach(line => {
        uniqueMap.set(line.text, line);
    });

    const uniqueLines = uniqueMap.values()
    const linesArray = Array.from(uniqueLines);
    View.openShowDocument(originName(textEditor), Lines.textFromLines(textEditor.document, linesArray));
}
export function countUniqueLinesToNewDocument(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const duplicateNumbers = 0;
    const countMap = new Map()
    const uniqueMap = new Map()
    lines.forEach(line => {
        uniqueMap.set(line.text, line);
        let count = countMap.get(line.text)
        if(!count) count = 0
        countMap.set(line.text,count + 1)
    });
    
    const uniqueLines = uniqueMap.values()
    const linesArray = Array.from(uniqueLines);
    let displayText = "";
    for(let line of linesArray) {
        displayText += countMap.get(line.text) + " " + ":" + " " + line.text + "\n";
    }
    View.openShowDocument(originName(textEditor), displayText)
}

export function filterLines(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = Lines.textOfLineSelectionOrWordAtCursor(textEditor.document, selection);
    // If we have multiple lines selected, use that as source to filter, else the entire document
    const range = selection.isSingleLine ? Region.makeRangeDocument(textEditor.document) : selection;

    let filteredLines = [];
    return View.promptForFilterExpression(selectedText)
        .then(fnFilter => {
            filteredLines = Lines.filterLines(textEditor.document, range, fnFilter);
            const content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
            Modify.replace(textEditor, range, content);
        })
}

export function filterLinesToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = Lines.textOfLineSelectionOrWordAtCursor(textEditor.document, selection);
    // If we have multiple lines selected, use that as source to filter, else the entire document
    const range = selection.isSingleLine ? Region.makeRangeDocument(textEditor.document) : selection;

    return View.promptForFilterExpression(selectedText)
        .then(fnFilter => {
            const filteredLines = Lines.filterLines(textEditor.document, range, fnFilter);
            return openShowDocumentWithLines(textEditor, filteredLines)
        })
}

type FilterContextOptions = {sectionByLevel?:number,
                             sectionByLevelRegex?:RegExp,
                             surroundingLines?:number,
                             surroundingRegex?:RegExp}

function parseNumberAndRegex(value:string) {
    if (!value) return {number: NaN, regex:null}
    const parts = value.split(' ', 2)
    if (parts.length===1) return {number:+value, regex:null}
    return {number:+parts[0], regex:new RegExp(parts[1], 'i')}
}

function isFilterContextOptionSet(options:FilterContextOptions) {
    return !isNaN(options.sectionByLevel) || !isNaN(options.surroundingLines)
}

/**
 * TODO
 * - add option for number of surrounding context lines (+linesUp/-linesDown)[numberLines] [optional regex]
 * - add option to include [levels from current] [regex]
 * - add option to include line numbers, original matches vs context matches.
 * - add a new picker to set all these options
 * 
 * @param textEditor 
 * @param selection 
 */
export function filterLinesWithContextToNewDocument(textEditor: vscode.TextEditor, selection:vscode.Selection) {
    const selectedText = Lines.textOfLineSelectionOrWordAtCursor(textEditor.document, selection);
    // If we have multiple lines selected, use that as source to filter, else the entire document
    const range = selection.isSingleLine ? Region.makeRangeDocument(textEditor.document) : selection;

    const regexOption        = View.makeOption({label: 'Filter', description: 'specify filter to select lines', value: selectedText, input: {prompt: 'Enter regex or [space] + literal', placeHolder:'abc.*'}})
    const surroundOption     = View.makeOption({label: 'Surrounding Lines', description: 'add nearby lines', input:{prompt:'[# lines] [optional regex]', placeHolder:'2 abc.*'}})
    const levelsOption       = View.makeOption({label: 'Parent Levels', description: 'add lines by relative section level', input:{prompt:'[# parent levels] [optional regex]', placeHolder:'2 abc.*'}})
    // TODO
    //const lineNumbersOption  = edit.makeOption({label: 'Line Numbers', description: 'include line numbers in output', value: false})
    View.promptOptions([
        regexOption,
        surroundOption,
        levelsOption,
        //lineNumbersOption
    ], (item, action)=>{
        if (View.QuickPickActionType.INPUT == action) {
            // don't process realtime input changes on large documents
            if (range.end.line - range.start.line > 10000) return
        }
        const contextOptions:FilterContextOptions = {
            surroundingLines: parseNumberAndRegex(surroundOption.value).number,
            surroundingRegex: parseNumberAndRegex(surroundOption.value).regex,
            sectionByLevel: parseNumberAndRegex(levelsOption.value).number,
            sectionByLevelRegex: parseNumberAndRegex(levelsOption.value).regex
        }
        
        const startTime = new Date().getMilliseconds()
        const fnFilter = View.makeFilterFunction(regexOption.value)
        let filteredLines = Lines.filterLines(textEditor.document, range, fnFilter)
        // TODO need to optimize the following for large documents
        if (isFilterContextOptionSet(contextOptions)) {
            filteredLines = filteredLines.map(line=>addContextLines(textEditor, line, contextOptions))
                .reduce((prevLines, currLines) => prevLines.concat(currLines))
                .sort((l1,l2)=>l1.lineNumber-l2.lineNumber)
                .reduce((a,b)=>{ // remove duplicates
                    if (a.indexOf(b) < 0) a.push(b)
                    return a
                },[] as vscode.TextLine[])
        }
        
        //console.log('changed', item?item.label:'', action, (new Date().getMilliseconds()) - startTime)
        openShowDocumentWithLines(textEditor, filteredLines)        
    })
}

function addContextLines(textEditor: vscode.TextEditor, line:vscode.TextLine, options: FilterContextOptions) {
    const tabSize = +textEditor.options.tabSize;
    let addedContextLines:vscode.TextLine[] = []

    if (!isNaN(options.sectionByLevel)) {
        const range = Region.makeRangeFromFoldingRegionRelativeLevel(textEditor.document,line.lineNumber,options.sectionByLevel, tabSize)
        let lines = Lines.linesFromRange(textEditor.document, range)
        if (options.sectionByLevelRegex)
            lines = lines.filter(line=>options.sectionByLevelRegex.test(line.text))
        addedContextLines = addedContextLines.concat(lines)
    }

    if (options.surroundingLines) {
        let lines = Lines.collectLines(textEditor.document, Math.max(0, line.lineNumber - options.surroundingLines), Math.min(textEditor.document.lineCount, line.lineNumber + options.surroundingLines))
        if (options.surroundingRegex)
            lines = lines.filter(line=>options.surroundingRegex.test(line.text))
        addedContextLines = addedContextLines.concat(lines)
    }
        
    // include the original filtered line
    addedContextLines.push(line);
    return addedContextLines
}

function openShowDocumentWithLines(textEditor: vscode.TextEditor, filteredLines:vscode.TextLine[]) {
    let content = ''
    if (filteredLines.length)
        content = filteredLines.map(line => line.text).reduce((prev, curr) => prev + "\n" + curr);
    return View.openShowDocument(originName(textEditor), content)
        .then(editor => {
            if (filteredLines.length < 1000) {
                const decorations = filteredLines.map((line, index) => View.createGutterDecorator(index, ': ' + (line.lineNumber + 1), '50px'));
                editor.setDecorations(gutterDecorationType, decorations);
            } else {
                editor.setDecorations(gutterDecorationType, [])
            }
            return editor;
        });
}

export function macroCreate() {
    return MacroBuilder.createMacro();
}

export function macroDelete() {
    return MacroBuilder.deleteMacro();
}
export function macroEdit() {
    return MacroBuilder.editMacro();
}

export function macroRun() {
    return MacroBuilder.runMacro();
}

export function macroRepeatLast() {
    MacroBuilder.runCurrentMacro()
}

export function alignToCursor(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    ranges = Region.makeVerticalRangesWithinBlock(textEditor, ranges);
    textEditor.selections = Region.makeSelectionsFromRanges(ranges);
    const lineInfos = Lines.makeLineInfos(textEditor, ranges);
    textEditor.edit(function (editBuilder) {
        lineInfos.forEach(line => {
            const lineLeftOfCursor = line.line.text.substring(0, line.range.start.character);
            const trimmedRight = line.line.text.substring(line.range.start.character).trim();

            editBuilder.replace(Region.expandRangeFullLineWidth(textEditor.document, line.range), lineLeftOfCursor + trimmedRight );
        });
    })
}

export async function alignCSV(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const userInput = await vscode.window.showInputBox({prompt:'Specify Delimiter', value: ','});
    const delimeter = JSON.parse(('\"' + userInput + '\"'));
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const linesParts = lines.map(line=>line.text.split(delimeter));
    const newLineTexts:string[] = []
    const linePartCount = linesParts[0].length;
    for (let columnIndex = 0; columnIndex < linePartCount; columnIndex++) {
        const max = maxLength(linesParts, 0);
        appendColumn(newLineTexts, linesParts, max);
        if (columnIndex != linePartCount - 1)
            appendDelimeter(newLineTexts, delimeter);
    }

    Modify.replaceLinesWithText(textEditor, lines, newLineTexts);
}

function appendColumn(lines:string[], linesParts:string[][], max:number) {
    for (let linePartIndex = 0; linePartIndex < linesParts.length; linePartIndex++) {
        const part = padRight(linesParts[linePartIndex].shift(), max);
        
        if (lines[linePartIndex] == undefined) lines[linePartIndex] = '';
        lines[linePartIndex] += part;
    }
}

function appendDelimeter(lines:string[], delimeter:string) {
    for (let linePartIndex = 0; linePartIndex  < lines.length; linePartIndex++) {
        lines[linePartIndex] = lines[linePartIndex] + delimeter
        
    }
}

function padRight(text:string, count:number) {
    const padAmount = count - text.length;
    return text + ' '.repeat(padAmount+1);
}

function maxLength(texts:string[][], partIndex:number) {
    let max = 0;
    return texts.map(text=>text[partIndex].length).reduce((prev, curr)=>{
        return curr>=prev?curr:prev;
    })
}

export async function compactCSV(textEditor: vscode.TextEditor, ranges: Array<vscode.Range>) {
    const userInput = await vscode.window.showInputBox({prompt:'Specify Delimiter', value: ','});
    const delimeter = JSON.parse(('\"' + userInput + '\"'));
    const lines = linesFromRangesExpandBlockIfEmpty(textEditor, ranges);
    const linesParts = lines.map(line=>line.text.split(delimeter));
    const newLineTexts:string[] = []
    const linePartCount = linesParts[0].length;
    for (let columnIndex = 0; columnIndex < linePartCount; columnIndex++) {
        const max = maxLength(linesParts, 0);
        compactColumn(newLineTexts, linesParts, max);
        if (columnIndex != linePartCount - 1)
            appendDelimeter(newLineTexts, delimeter);
    }

    Modify.replaceLinesWithText(textEditor, lines, newLineTexts);
}

function compactColumn(lines:string[], linesParts:string[][], max:number) {
    for (let linePartIndex = 0; linePartIndex < linesParts.length; linePartIndex++) {
        const part = linesParts[linePartIndex].shift().trim()
        
        if (lines[linePartIndex] == undefined) lines[linePartIndex] = '';
        lines[linePartIndex] += part;
    }
}

export function copyToNewDocument(textEditor: vscode.TextEditor) {
    Region.selectionsOrMatchesAsSelectionsOrDocument(textEditor)
        .then(selections=> {
            const textFromSelections = Region.textsFromRanges(textEditor.document, selections);
            View.openShowDocument(originName(textEditor), textFromSelections.join('\n'));
        });
}

export function selectLines(textEditor: vscode.TextEditor) {
    Region.selectionsOrMatchesAsSelectionsOrDocument(textEditor)
        .then(selections=> {
            textEditor.selections = selections.map(selection=> {
                const range = Region.expandRangeFullLineWidth(textEditor.document, selection)
                return new vscode.Selection(range.start, range.end);
            })
        });
}

export function linesAsJSON(textEditor: vscode.TextEditor) {
    const lines = Lines.linesFromRange(textEditor.document, textEditor.selection)
    const jsonLines = lines.map(line=>JSON.stringify(line.text) + ",")
    Modify.replaceLinesWithText(textEditor, lines, jsonLines);
}