import React, { Component } from 'react';

/***************************
 * Output Component
***************************/

// Output Component presents an unordered list made from a single string, split on the '\n' character.
const Output = props => (
  <div id={props.outputId}>
    <ul>
      {props.content.split('\n').map((item, i) => <li key={`${props.outputId}-${i}`}>{item}</li>)}
    </ul>
  </div>
); // End Output Component.

export default Output;