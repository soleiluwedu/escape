import React, { Component } from 'react';

// Button Component is a presentation component.
const Button = (props) => (
  <div className="button" id={props.btnId} >
    <button onClick={props.onclick}>{props.text}</button>
  </div>
);

export default Button;