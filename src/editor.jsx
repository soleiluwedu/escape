import React, { Component } from 'react';

/***************************
 * Editor Component
***************************/

// Editor Component shows code inputted / editted by user(s).
class Editor extends Component {

  /***************************
  * Editor.constructor
  ***************************/

  // Main constructor method.
  constructor(props) {

    // Props included out of necessity.
    super(props);

    // Local state used for editor-specific settings like key-specific behavior.
    this.state = {

      // this.state.editorTabSpaces sets how many spaces to add on a tab keydown.
      editorTabSpaces: 2

    }; // End this.state.

  } // End main constructor.

  /***************************
   * Editor.onkeydown
  ***************************/

  // Needed for any key-press-specific functionality.
  onkeydown(e) {

    // When user presses the 'Tab' key, added two spaces and move selection indices.
    if (e.key === 'Tab') {

      // Prevent default behavior.
      e.preventDefault();

      // Save selection start point.
      const selStart = e.target.selectionStart;

      // Save selection end point.
      const selEnd = e.target.selectionEnd;

      // Collect Editor content before selection start.
      let newEditorContent = e.target.value.slice(0, selStart);

      // Add appropriate number of spaces for one keypress of the 'Tab' key.
      for (let i = 0; i < this.state.editorTabSpaces; i++) newEditorContent += ' ';

      // Collect Editor content after selection end.
      newEditorContent += e.target.value.slice(selStart);

      // Update Editor content.
      e.target.value = newEditorContent;

      // Resetting selection start according to new Editor content.
      e.target.selectionStart = selStart + this.state.editorTabSpaces;

      // Resetting selection end according to new Editor content.
      e.target.selectionEnd = selEnd + this.state.editorTabSpaces;

    } // End 'Tab' if-block.

  } // End onkeydown method.

  /***************************
   * Editor.render
  ***************************/

  // Render textarea as code editor.
  render() {
    return (
      <div id={this.props.editorId}>
        <textarea
          // Should be passed from parent component to report textarea value on change.
          onChange={e => this.props.onchange(e)}
          // Local method used for key-specific functionality.
          onKeyDown={e => this.onkeydown(e)}
        >
          {/* Content of editor textarea, to be updated by parent on change. */}
          {this.props.content}
        </textarea>
      </div>
    );
  } // End render method.

} // End Editor Component.

export default Editor;