import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Button from './button.jsx';
import Output from './output.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Value of editor textarea.
      editorContent: '',

      // Value of Output Component's div.
      outputContent: ''
    }

    // Bind functions that will be passed to children components.
    this.onchange = this.onchange.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    this.runcode = this.runcode.bind(this);

  }

  // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
  onchange(e) {
    this.setState({ editorContent: e.target.value });
  }

  // Needed for any key-specific functionality.
  onkeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const selStart = e.target.selectionStart;
      const selEnd = e.target.selectionEnd;
      e.target.value = e.target.value.slice(0, selStart) + '  ' + e.target.value.slice(selStart);
      e.target.selectionStart = selStart + this.state.editorTabSpaces;
      e.target.selectionEnd = selEnd + this.state.editorTabSpaces;
    }
  }


  // Stringify data.
  stringify(obj) {

    // These data types do not have toString() functionality and do not render properly to a React DOM.
    switch (obj) {
      case undefined: return 'undefined';
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    // Stringify conditionally and possibly recursively according to data type.
    switch (obj.constructor) {

      // Recursive stringify any nested Object literals.
      case Object: return `{ ${Object.keys(obj).map((key, i) => (i === 0 ? '' : ' ') + key + ": " + this.stringify(obj[key]))} }`;

      // Recursive stringify any nested Array instances.
      case Array: return `[${obj.map((e, i) => (i === 0 ? '' : ' ') + this.stringify(e))}]`;

      // Functions have toString() functionality.
      case Function: return obj.toString();

      // Strings need quotes.
      case String: return `'${obj}'`;

      // All others need not be stringified
      default: return obj;

    }

  }

  // When user clicks "Run Code" button.
  runcode() {

    // Variable to refer to evaluated code.
    let evaluated;

    // Try-catch block for evaluating code in case of errors.
    try { evaluated = eval(this.state.editorContent); }

    // If error, output error message and return out of function.
    catch (err) { return this.setState({ outputContent: err.message }); }

    // Code reachable only without error. Output evaluated code.
    this.setState({ outputContent: this.stringify(evaluated) });

  }

  // Render code editor and console output.
  render() {
    return (
      <div id="app">
        <h1 id="title">Eval/Stringify/Console.log: A Programmer's Editor</h1>
        <Editor onchange={this.onchange} onkeydown={this.onkeydown} editorId="editor" />
        <Button onclick={this.runcode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    )
  }
}

render(<App />, document.getElementById('x'));