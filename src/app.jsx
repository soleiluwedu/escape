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
      outputContent: '',

      // Boolean to indicate if worker is currently evalling.
      working: false
    }

    // Bind functions that will be passed to children components.
    this.onchange = this.onchange.bind(this);
    this.runcode = this.runcode.bind(this);
    this.renderOutput = this.renderOutput.bind(this);
  }

  evalWithWorker(code) {
    // Worker to eval code and terminate it if needed.
    const evalWorker = new Worker('./src/worker.js');

    // Update output upon worker response.
    evalWorker.addEventListener('message', workerResponse => this.renderOutput(workerResponse.data));

    // Passing code to worker to eval it.
    evalWorker.postMessage(code);

    // Kill worker after half a second if it is still working.
    setTimeout(() => {
      if (this.state.working) {
        this.setState({ working: false });
        evalWorker.terminate();
        this.renderOutput('Code timed out.');
      }
    }, 500);
  }

  // Render worker output (return value of evalled code) to DOM.
  renderOutput(output) { this.setState({ outputContent: output, working: false }); }

  // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
  onchange(e) { this.setState({ editorContent: e.target.value }); }

  // When user clicks "Run Code" button.
  runcode() {
    if (this.state.working) return this.setState({ outputContent: 'Previous Run Code command still executing.' });
    this.setState({ working: true });
    this.evalWithWorker(this.state.editorContent);
  }

  // Render code editor and console output.
  render() {
    return (
      <div id="app">
        <h1 id="title"><b>E</b>val/<b>S</b>tringify/<b>C</b>onsole.log: <b>A</b> <b>P</b>rogrammer's <b>E</b>ditor</h1>
        <Editor onchange={this.onchange} onkeydown={this.onkeydown} editorId="editor" />
        <Button onclick={this.runcode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    )
  }
}

render(<App />, document.getElementById('x'));