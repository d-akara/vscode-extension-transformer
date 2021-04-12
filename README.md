# Transformer

![ScreenShot](/readme-images/github-banner.png)

- Provides enhanced editing capabilities which operate on either current document or can pipe output to a new document.
- Most commands implement auto scoping to select current block, document or selection as the target of an operation.
   - A block refers to code that has an empty line above and below.

## Features

* [Align CSV](#align-csv)
* [Align To Cursor](#align-to-cursor)
* [Compact CSV](#compact-csv)
* [Copy To New Document](#copy-to-new-document)
* [Count Duplicate Lines As New Document](#count-duplicate-lines-as-new-document)
* [Encode / Decode](#encode-/-decode)
* [Filter Lines As New Document](#filter-lines-as-new-document)
* [Filter Lines](#filter-lines)
* [Join Lines](#split-lines)
* [JSON String As Text](#json-string-as-text)
* [Lines As JSON String Array](#lines-as-json-string-array)
* [Normalize Diacritical Marks](#normalize-diacritical-marks)
* [Randomize Lines](#randomize-lines)
* [Randomize Selections](#randomize-selections)
* [Reverse Lines](#reverse-lines)
* [Reverse Selections](#reverse-selections)
* [Rotate Backward Selections](#rotate-backward-selections)
* [Rotate Forward Selections](#rotate-forward-selections)
* [Select Highlights](#select-highlights)
* [Select Lines](#select-lines)
* [Selection As JSON String](#selection-as-json-string)
* [Sort Lines By Length](#sort-lines-by-length)
* [Sort Lines](#sort-lines)
* [Sort Selections](#sort-selections)
* [Split Lines After](#split-lines)
* [Split Lines Before](#split-lines)
* [Split Lines](#split-lines)
* [Trim Lines](#trim-lines)
* [Trim Selections](#trim-selections)
* [Unique Lines As New Document](#unique-lines-as-new-document)
* [Unique Lines](#unique-lines)

### Unique Lines
- Removes duplicate lines from the document
- Operates on selection or current block if no selection


### Unique Lines As New Document
- Unique lines are opened in a new document
- Operates on selection or current block if no selection


### Filter Lines
- Keep matching lines of filter
- Operates on selection or entire document if no selection
- Filter using regex or literal


### Filter Lines As New Document
- A new document is created with lines matching filter
- Gutter decorators show original line number from original document
- Operates on selection or entire document if no selection
- Filter using regex or literal
- Add lines relative to filtered lines by count and regular expression match
- `Parent Levels` add context by indentation level.  Similar to vscode folding levels. 
  - Examples:
    - `0` will include all siblings of the matched lines.  Where a sibling is determined by being at the same indentation level next to the matched line.
    - `1` will include all siblings + the parent siblings ( one less indentation level )

![ScreenShot](/readme-images/Filter-lines-as-new-document.png)

### Sort Lines
- Sorts by column when there is a vertical stack of multiple cursors using the cursor position to determine sort text for the line.
- Operates on selection or entire document if no selection

![ScreenShot](/readme-images/sort-lines.png)
![ScreenShot](/readme-images/sort-lines-by-column.png)

### Sort Lines By Length
- Sorts by length of the line
- Operates on selection or current block if no selection

![ScreenShot](/readme-images/sort-lines-by-length.png)

### Align To Cursor
- Aligns text right of cursor to cursor position
- Single cursor will auto expand vertically to block

![ScreenShot](/readme-images/align-to-cursor.png)

### Align CSV
- Aligns CSV text into columns.  Can also specify custom delimiter.

![ScreenShot](/readme-images/Align-CSV.png)

### Compact CSV
- Does the opposite of `Align CSV`, removes white space between columns.

![ScreenShot](/readme-images/Compact-CSV.png)

### Copy To New Document
- Copies selections to a new document
- Operates on selections or find match results or entire document

![ScreenShot](/readme-images/Copy-to-new-document.png)

### Select Lines
- Expands all current find match results or cursors to full line selections

### Lines As JSON String Array
- Converts each line to a JSON string
- Useful for easily creating snippet bodies with selected text

![ScreenShot](/readme-images/Lines-as-JSON-string-array.png)

### Selection As JSON String
- Transform all contents of selection as a single JSON String

![ScreenShot](/readme-images/Selection-as-JSON-String.png)

### Trim Lines
- Remove whitespace at beginning and end of lines

### Randomize Lines
- Randomize the order of selected lines

### Reverse Lines
- Reverse the order of selected lines

### Count Duplicate Lines As New Document
- Count the number of instances of each unique line

![ScreenShot](/readme-images/Count-duplicate-lines-as-new-document.png)

### Encode / Decode
- Encode Base64
- Decode Base64
- Encode URL Segment
- Decode URL Segment
- Encode x-www-form-urlencoded
- Decode x-www-form-urlencoded
- Hash MD5

![ScreenShot](/readme-images/Encode-Decode.png)

### JSON String As Text
- unescapes a JSON string to text

![ScreenShot](/readme-images/JSON-String-as-text.png)

### Split Lines
- split lines using specified delimeter

### Split Lines After 
- splits lines after the delimeter while keeping the delimeter

### Split Lines Before
- splits lines before the delimeter while keeping the delimeter

### Join Lines
- join lines using specified delimeter

![ScreenShot](/readme-images/Join-lines.png)

### Select Highlights
- make selections of all text highlighted in the editor

### Randomize Selections
 - replace selections with random order of selected text
### Reverse Selections
 - replace selections with reverse order of selected text
### Sort Selections
 - replace selections with sorted order of selected text

 ![ScreenShot](/readme-images/sort-selections.png)

### Trim Selections
 - replace selections with trimmed selected text
### Rotate Forward Selections
 - rotates the order of the selections forward
### Rotate Backward Selections
 - rotates the order of the selections backward
### Normalize Diacritical Marks
 - transforms accented characters to non-accented versions

 ![ScreenShot](/readme-images/Normalize-Diacritical-Marks.png)