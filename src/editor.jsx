import React, { Component } from 'react';

// Editor Component shows code inputted / editted by user(s).
const Editor = (props) => (
  <div id="editor">
    <textarea onChange={e => props.onchange(e)}>
      {props.content}
    </textarea>
  </div>
);

export default Editor;