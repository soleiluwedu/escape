import React, { Component } from 'react';

// Editor Component shows code inputted / editted by user(s).
const Output = (props) => (
  <div id="output">
    {props.content}
  </div>
);

export default Output;