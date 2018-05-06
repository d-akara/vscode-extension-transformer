# Transformer

- Provides enhanced editing capabilities which operate on either current document or can pipe output to a new document.
- Most commands implement auto scoping to select current block, document or selection as the target of an operation.
   - A block refers to code that has an empty line above and below.

## Features

* [Unique Lines](#unique-lines)
* [Unique Lines As New Document](#unique-lines-as-new-document)
* [Filter Lines](#filter-lines)
* [Filter Lines As New Document](#filter-lines-as-new-document)
* [Sort Lines](#sort-lines)
* [Sort Lines By Length](#sort-lines-by-length)
* [Align To Cursor](#align-to-cursor)
* [Align CSV](#align-csv)
* [Compact CSV](#compact-csv)
* [Copy To New Document](#copy-to-new-document)
* [Select Lines](#select-lines)
* [Lines As JSON](#lines-as-json)
* [Trim Lines](#trim-lines)
* [Count Duplicate Lines As New Document](#count-duplicate-lines-as-new-document)
* [Macros](#macros)

### Unique Lines
- Removes duplicate lines from the document
- Operates on selection or current block if no selection

![ScreenShot](/readme-images/unique-lines.gif)

### Unique Lines As New Document
- Unique lines are opened in a new document
- Operates on selection or current block if no selection

![ScreenShot](/readme-images/unique-lines-document.gif)

### Filter Lines
- Keep matching lines of filter
- Operates on selection or entire document if no selection
- Filter using regex or literal

![ScreenShot](/readme-images/filter.gif)

### Filter Lines As New Document
- A new document is created with lines matching filter
- Gutter decorators show original line number from original document
- Operates on selection or entire document if no selection
- Filter using regex or literal
- Add lines relative to filtered lines by count and regular expression match

![ScreenShot](/readme-images/filter-new-document.gif)

### Sort Lines
- Sorts by column when there is a vertical stack of multiple cursors using the cursor position to determine sort text for the line.
- Operates on selection or entire document if no selection

![ScreenShot](/readme-images/sort-lines.gif)

### Sort Lines By Length
- Sorts by length of the line
- Operates on selection or current block if no selection

![ScreenShot](/readme-images/sort-lines-length.gif)

### Align To Cursor
- Aligns text right of cursor to cursor position
- Single cursor will auto expand vertically to block

![ScreenShot](/readme-images/align-cursor.gif)

### Align CSV
- Aligns CSV text into columns.  Can also specify custom delimiter.

![ScreenShot](/readme-images/align-csv.gif)

### Compact CSV
- Does the opposite of `Align CSV`, removes white space between columns.

### Copy To New Document
- Copies selections to a new document
- Operates on selections or find match results or entire document

### Select Lines
- Expands all current find match results or cursors to full line selections

### Lines As JSON
- Converts each line to a JSON string
- Useful for easily creating snippet bodies with selected text

![ScreenShot](/readme-images/lines-as-json.gif)

### Trim Lines
- Remove whitespace at beginning and end of lines

### Count Duplicate Lines As New Document
- Count the number of instances of each unique line

### Macros
- [Experimental feature to provide text editor macros as scripts](https://github.com/dakaraphi/vscode-extension-transformer/issues/13)