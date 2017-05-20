import React, { Component } from 'react';

// Editor Component shows code inputted / editted by user(s).
const Output = (props) => (
  <div id={props.outputId}>
    <ul>
      {props.content.split('\n').map((item, i) => <li key={`${props.outputId}-${i}`}>{item}</li>)}
    </ul>
  </div>
);

export default Output;