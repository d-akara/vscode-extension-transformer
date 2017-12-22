# Transformer

- Provides enhanced editing capabilities which operate on either current document or can pipe output to a new document.
- Most commands implement auto scoping to select current block, document or selection as the target of an operation.

## Features

### Filter Lines
- Keep matching lines of filter
- Filters entire document or selection if exists
- Filter using regex or literal

![ScreenShot](/readme-images/filter.gif)

### Filter Lines As New Document
- A new document in editor column two is created with lines matching filter
- Gutter decorators show original line number from original document
- Filters entire document or selection if exists
- Filter using regex or literal

![ScreenShot](/readme-images/filter-new-document.gif)
### Sort Lines
- Sorts current block or selection if exists
- Sorts by column when there is a vertical stack of multiple cursors using the cursor position to determine sort text for the line.

![ScreenShot](/readme-images/sort-lines.gif)
### Align To Cursor
- Aligns text right of cursor to cursor position
- Single cursor will auto expand vertically to block

![ScreenShot](/readme-images/align-cursor.gif)
### Align CSV
- Aligns CSV text into columns and removes delimeter

![ScreenShot](/readme-images/align-csv.gif)