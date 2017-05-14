import React, { Component } from 'react';

// Editor Component shows code inputted / editted by user(s).
class Editor extends Component {
  constructor(props) {
    super(props);
    // Local state used for editor-specific settings like key-specific behavior.
    this.state = {
      // How many spaces to add on a tab keydown.
      editorTabSpaces: 2,
    };
  }

  // Needed for any key-specific functionality.
  onkeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();

      // Saving selection.
      const selStart = e.target.selectionStart;
      const selEnd = e.target.selectionEnd;

      // Adding spaces.
      let newContent = e.target.value.slice(0, selStart);
      for (let i = 0; i < this.state.editorTabSpaces; i++) newContent += ' ';
      newContent += e.target.value.slice(selStart);
      e.target.value = newContent;

      // Resetting selection according to new content.
      e.target.selectionStart = selStart + this.state.editorTabSpaces;
      e.target.selectionEnd = selEnd + this.state.editorTabSpaces;
    }
  }

  render() {
    return (
      <div id={this.props.editorId}>
        <textarea
          // Should be passed from parent component to report textarea value.  
          onChange={e => this.props.onchange(e)}
          // Local method used for key-specific functionality.
          onKeyDown={e => this.onkeydown(e)}
        >
          {/* Content of editor textarea, to be updated by parent on change. */}
          {this.props.content}
        </textarea>
      </div>
    );
  }
}

export default Editor;