import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Button from './button.jsx';
import Output from './output.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      outputContent: ''
    }
    this.onchange = this.onchange.bind(this);
    this.runcode = this.runcode.bind(this);
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

    // Stringify conditionally.
    switch (obj.constructor) {

      // Recursive stringify any nested Object literals.
      case Object: return `{ ${Object.keys(obj).map(key => key + ": " + this.stringify(obj[key]))} }`;

      // Recursive stringify any nested Array instances.
      case Array: return `[${obj.map((e, i) => i !== 0 ? " " + this.stringify(e) : this.stringify(e))}]`;

      // Functions have toString() functionality.
      case Function: return obj.toString();

      // Strings need quotes.
      case String: return `'${obj}'`;

      // All others need not be stringified
      default: return obj;
    }
  }

  // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
  onchange(e) {
    this.setState({ editorContent: e.target.value });
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
        <Editor onchange={this.onchange} editorId="editor" />
        <Button onclick={this.runcode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    )
  }
}

render(<App />, document.getElementById('x'));