# Transformer

- Provides enhanced editing capabilities which operate on either current document or can pipe output to a new document.
- Most commands implement auto scoping to select current block, document or selection as the target of an operation.

## Features

### Filter Lines
- Filters entire document or selection if exists
- Filter using regex or literal
- Current document is modified
### Filter Lines As New Document
- Filters entire document or selection if exists
- Filter using regex or literal
- A new document in editor column two is created with the results
### Sort Lines
- Sorts current block or selection if exists
- Sorts by column when there is a vertical stack of multiple cursors using the cursor position to determine sort text for the line.
- Current document is modified