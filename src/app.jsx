import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Output from './output.jsx';
import Button from './button.jsx';

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
    // These data types do not have toString() functionality.
    switch (obj) {
      case undefined: return 'undefined';
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    // Stringify conditionally.
    switch (obj.constructor) {

      // Recursive stringify Object literals.
      case Object: return `{ ${Object.keys(obj).map(key => key + ": " + this.stringify(obj[key]))} }`;

      // Return Array string.
      case Array: return `[${obj.map((e, i) => i !== 0 ? " " + this.stringify(e) : this.stringify(e))}]`;

      // Functions have toString() functionality.
      case Function: return obj.toString();

      // Strings need quotes.
      case String: return `'${obj}'`

      // All others.
      default: return obj;
    }
  }

  // On change of editor.
  onchange(e) {
    this.setState({ editorContent: e.target.value });
  }

  // When user clicks "Run Code" button.
  runcode() {
    let evaluated;
    try { evaluated = eval(this.state.editorContent); }
    catch (err) { return this.setState({ outputContent: err.message }); }
    this.setState({ outputContent: this.stringify(evaluated) });
  }

  // Render code editor and console output.
  render() {
    return (
      <div id="app">
        <h1 id="title">ESC (Eval/Stringify/Console)</h1>
        <Editor onchange={this.onchange} />
        <Button onclick={this.runcode} btnID="runcode" text="Run Code" />
        <Output content={this.state.outputContent} />
      </div>
    )
  }
}

render(<App />, document.getElementById('x'));