import React, { Component } from 'react';

// Button Component is a presentational component.
const Button = (props) => (
  <div className={props.btnClass} id={props.btnId} >
    <button onClick={props.onclick}>{props.text}</button>
  </div>
);

export default Button;