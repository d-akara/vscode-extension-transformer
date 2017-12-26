# Transformer

- Provides enhanced editing capabilities which operate on either current document or can pipe output to a new document.
- Most commands implement auto scoping to select current block, document or selection as the target of an operation.
   - A block refers to code that has an empty line above and below.

## Features

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
- Aligns CSV text into columns and removes delimeter

![ScreenShot](/readme-images/align-csv.gif)

### Copy To New Document
- Copies selections to a new document
- Operates on selections or find match results or entire document