## 1.6.0
- New Features
  - `Encode / Decode ...`
    - Decode Base64
    - Encode Base64
    - Encode URL Segment
    - Decode URL Segment
    - Encode x-www-form-urlencoded
    - Decode x-www-form-urlencoded
    - Encode MD5
  - `Selection As JSON String` converts all text in selection to single escaped JSON string
  - `JSON String As Text` unescapes a JSON string to text
- Improved
  - sort - now uses natural sort algorithm

## 1.5.0
- New Feature `Macro Scripts`
  - Write text editor macros as scripts
  - Currently this feature is Experimental - for reference https://github.com/dakaraphi/vscode-extension-transformer/issues/13
## 1.4.0
- Enhanced `Filter Lines As New Document` command
  - Realtime filtering as you type for smaller documents
  - Add contextual lines relative to filtered lines to output
- New document commands now create document title related to original instead of generic untitled
- Updated some command descriptions and titles
- Fixed bug in filtering commands which prevented filtering properly on selections
## 1.3.2
- Added `Lines As JSON` command which Converts each line to a JSON string.  Useful for easily creating snippet bodies from selected text
## 1.2.0
- Added `Select Lines` command which expands all current find match results or cursors to full line selections
## 1.1.0
- Changed `Align CSV` to preserve delimeter so that it can be used for round trip editing
- Added `Compact CSV` command so that aligned CSV can be restored to its compact format
## 1.0.2
- Added `Copy To New Document` command
- Changed regex filters to use case insensitve
## 1.0.0
- Initial release  






