import React, { Component } from 'react';

// Editor Component shows code inputted / editted by user(s).
const Output = (props) => (
  <div id={props.outputId}>
    {props.content}
  </div>
);

export default Output;