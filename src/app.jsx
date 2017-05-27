import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Button from './button.jsx';
import Output from './output.jsx';
import ExecOps from './execops/hq';

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

    // this.executor contains ExecOps class to run eval operations.
    this.executor = new ExecOps('./src');

    // Pass function to ExecOps object to cause render on receipt of console.logs.
    this.executor.onend = logs => this.renderOutput(this.state.outputContent + logs);

  } // End App.constructor

  /***************************
   * App.onchange
  ***************************/

  // App.onchange keeps track of editor text to send to ExecOps object and possibly for code-sharing.
  onchange = e => {

    // Save editor content.
    this.setState({ editorContent: e.target.value });

  } // End App.onchange

  /***************************
   * App.runcode
  ***************************/

  // App.runcode clears output and sends editor content to ExecOps object and possibly code-share peers.
  runcode = () => {

    // Clear output.
    this.renderOutput('');

    // If ExecOps object is still running opertions, cancel new mission.
    if (this.executor.active()) this.renderOutput('Previous Run Code command is still executing.\n');

    // Send editor content to ExecOps object to execute.
    else this.executor.newmission(this.state.editorContent);

  } // End App.runcode

  /***************************
   * App.endcode
  ***************************/

  // App.endcode terminates ExecOps operations.
  endcode = () => {

    // Kill all ExecOps operations.
    this.executor.redbutton();

    // Log message to give feedback to user.
    this.renderOutput(this.state.outputContent + 'Code ended by user.\n');

  } // End App.endcode

  /***************************
   * App.renderOutput
  ***************************/

  // App.renderOutput prints text to the output that serves as an in-app console.
  renderOutput = output => {

    // Show output to user. Output will be single string split on '\n' to make list items.
    this.setState({ outputContent: output });

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