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
    }

    // this.shadowState contains application state that is not passed down as props.
    this.shadowState = {
      // Next worker ID that will be used.
      nextID: false,

      // Object with worker ID keys and boolean values to track if worker is still working.
      workerStatuses: {},

      // Number tracks total number of workers still active.
      totalActive: 0
    }

    // Bind functions that will be passed to children components.
    this.onchange = this.onchange.bind(this);
    this.runcode = this.runcode.bind(this);
    this.renderOutput = this.renderOutput.bind(this);
  }

  // Creates worker to eval code without risk of crashing main script.
  evalWithWorker(commandObj) {

    // Unique ID to track worker status. Increment main count after saving ID.
    const id = this.shadowState.nextID++;
    this.shadowState.totalActive++;

    // Instantiate worker.
    const evalWorker = new Worker('./src/worker.js');

    // Worker is working.
    this.shadowState.workerStatuses[id] = true;

    // Update output upon worker response.
    evalWorker.addEventListener('message', response => {
      switch (response.data.action) {
        // Render one more line of output.
        case 'addline': return this.renderOutput(this.state.outputContent + response.data.content);

        // Spawn a new worker once. Used for setTimeout.
        case 'spawn': return this.evalWithWorker({ command: 'eval', payload: response.data.content });

        // Spawn a new worker continuously with setInterval.
        case 'spawnInterval': return this.evalWithWorker({ command: 'setInterval', func: response.data.func, wait: response.data.wait });
        
        // Use setTimeout to kill a workers so we do not build up total number of workers. Omit break or return to fall to next line.
        case 'finishSetInterval': setTimeout(() => evalWorker.terminate(), response.data.wait);
        
        // Worker 'finish' and 'finishSetInterval' responses BOTH trigger shadowState updates.
        case 'finish':
          this.shadowState.workerStatuses[id] = false;
          this.shadowState.totalActive--;
          return;
      }
    });

    // Passing command object to worker to eval code.
    evalWorker.postMessage(commandObj);

    // Kill worker after half a second if it is still working.
    setTimeout(() => {
      if (this.shadowState.workerStatuses[id]) {
        evalWorker.terminate();
        this.shadowState.workerStatuses[id] = false;
        this.shadowState.totalActive--;
        this.renderOutput(this.state.outputContent + 'Error: Code timed out.\n');
      }
    }, 500);
  }

  // Render worker output (return value of evalled code) to DOM.
  renderOutput(output) { this.setState({ outputContent: output }); }

  // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
  onchange(e) { this.setState({ editorContent: e.target.value }); }

  // When user clicks "Run Code" button.
  runcode() {
    if (this.shadowState.totalActive) return this.renderOutput('Error: Previous Run Code command still executing.');
    this.renderOutput('');
    this.evalWithWorker({ command: 'eval', payload: this.state.editorContent });
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