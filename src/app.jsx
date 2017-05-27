import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Button from './button.jsx';
import Output from './output.jsx';

/***************************
 * App Component
***************************/

class App extends Component {

  /***************************
   * App.constructor
  ***************************/

  // App.constructor fires on initiation of App Component.
  constructor(props) {

    // Props included for good practice, not out of necessity.
    super(props);

    // this.state object serves as part of standard React data flow.
    this.state = {

      // this.state.editorContent is the value of editor textarea.
      editorContent: '',

      // this.state.outputContent is the text to show in the in-app console output.
      outputContent: '',

    } // End this.state object

    // Bind App Component methods that will be passed to children components.
    this.onchange = this.onchange.bind(this);
    this.runcode = this.runcode.bind(this);
    this.endcode = this.endcode.bind(this);
    this.renderOutput = this.renderOutput.bind(this);

  } // End App.constructor

  /***************************
   * App.onchange
  ***************************/

  // App.onchange keeps track of editor text to send to ExecOps and possibly for code-sharing.
  onchange(e) {

    // Save editor content.
    this.setState({ editorContent: e.target.value });

  } // End App.onchange

  /***************************
   * App.runcode
  ***************************/

  // App.runcode clears output and sends editor content to ExecOps and possibly code-share peers.
  runcode() {

    // Clear Output Component's content.
    this.renderOutput('');

    // Send Editor Component's content to ExecOps.
    this.briefAsset(this.state.editorContent);

  } // End App.runcode

  /***************************
   * App.endcode
  ***************************/

  // App.endcode terminates ExecOps operations.
  endcode() {
    console.info('MAIN: console.log is ' + console.log);

    // End asset's contract in the most permanent manner possible.
    this.killAsset();

    // Release a PR statement.
    this.renderOutput(this.state.outputContent + 'Code ended.\n');

  } // End App.endcode

  /***************************
   * App.renderOutput
  ***************************/

  // App.renderOutput prints text to the output that serves as an in-app console.
  renderOutput(output) {

    // Add any pre or post messages handed down from this.shadowState.
    const totalOutput = this.shadowState.preRecord + output + this.shadowState.postRecord;

    // Pre and post messages can be wiped after collection.
    this.shadowState.preRecord = this.shadowState.postRecord = '';

    // Show output to user. Output will be single string split on '\n' to make list items.
    this.setState({ outputContent: totalOutput });

  } // End App.renderOutput

  /***************************
   * App.render
  ***************************/

  // App.render shows code editor (Editor Component) and console output (Output Component).
  render() {
    return (
      <div id="app">
        <h1 id="title"><b>E</b>val/<b>S</b>tringify/<b>C</b>onsole.log: <b>A</b> <b>P</b>rogrammer's <b>E</b>ditor</h1>
        <Editor onchange={this.onchange} onkeydown={this.onkeydown} editorId="editor" />
        <Button onclick={this.runcode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Button onclick={this.endcode} btnClass="btnClass" btnID="endcode" text="End Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    );
  } // End App.render

} // End App Component

// Targets div on index.html with id of 'x' as entry point for React App Component.
render(<App />, document.getElementById('x'));