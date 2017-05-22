import React, { Component } from 'react';
import { render } from 'react-dom';
import Editor from './editor.jsx';
import Button from './button.jsx';
import Output from './output.jsx';

class App extends Component {

  // Main constructor method.
  constructor(props) {

    // Included for good practice, not out of necessity.
    super(props);

    // Standard React this.state. Contains information collected from or outputted to DOM.
    this.state = {

      // Value of editor textarea.
      editorContent: '',

      // Value of Output Component's div.
      outputContent: '',

    } // End this.state object.

    // this.shadowState contains state secrets not shared elsewhere in the application.
    this.shadowState = {

      // Asset is a web worker to be used to eval code to help keep the main script safe from errors.
      asset: null,

      // Boolean to indicate if there is a deployed asset.
      assetDeployed: false,

      // setTimeout ID of function to kill asset if asset has not checked in recently.
      assassinID: null,

      // Assets must check in after 'deadline' number of milliseconds, or be killed.
      deadline: 1000

    } // End this.shadowState object.

    // Bind methods that will be passed to children components.

    // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
    this.onchange = this.onchange.bind(this);

    // When "Run Code" button is clicked, clear Output Component and brief asset.
    this.runcode = this.runcode.bind(this);

    // Render output to Output Component.
    this.renderOutput = this.renderOutput.bind(this);

  } // End main constructor method.

  // Keep track of editor text. May come in handy if code-sharing funtionality is added in the future.
  onchange(e) { this.setState({ editorContent: e.target.value }); }

  // When "Run Code" button is clicked, clear Output Component and brief asset.
  runcode() {

    // Clear Output Component's content.
    this.renderOutput('');

    // Send Editor Component's content to asset as mission briefing.
    this.briefAsset(this.state.editorContent);

  } // End runcode method.

  // Render output to Output Component.
  renderOutput(output) { this.setState({ outputContent: output }); }

  // Deploy asset for initial mission and stay deployed for asynchronous mission creep.
  deployAsset() {

    // Activate asset.
    this.shadowState.asset = new Worker('./src/worker.js');

    // Update record to indicate that an asset is currently deployed.
    this.shadowState.assetDeployed = true;

    // Protocol for receipt of report from asset.
    this.shadowState.asset.onmessage = report => {

      // Cancel hit.
      clearTimeout(this.shadowState.assassinID);

      // Deliver report from asset.
      return this.renderOutput(this.state.outputContent + report.data);

    } // End this.shadowState.asset.onmessage method.

  } // End deployAsset method.

  // Brief asset on mission. Deploy new asset first if none are active.
  briefAsset(code) {

    // If no assets are currently deployed, deploy a new asset.
    if (!this.shadowState.assetDeployed) this.deployAsset();

    // Send mission briefing to asset.
    this.shadowState.asset.postMessage(code);

    // Put out a hit on the asset that will be cancelled if asset reports back in time.
    this.assassinStandby();

  } // End briefAsset method.

  // Activate assassin to eliminate asset upon lack of timely report.
  assassinStandby() {

    // Save setTimeout ID of assassin to allow cancellation.
    this.shadowState.assassinID = setTimeout(() => {

      // Assassinate asset.
      this.shadowState.asset.terminate();

      // Update record to indicate no assets currently deployed.
      this.shadowState.assetDeployed = false;

      // Put out a public statement covering up the incident.
      this.renderOutput('Code timed out.');

      // setTimeout delay: Asset must report back in time or be eliminated.
    }, this.shadowState.deadline);

  } // End assassinStandby method.

  // Render code editor (Editor Component) and console output (Output Component).
  render() {
    return (
      <div id="app">
        <h1 id="title"><b>E</b>val/<b>S</b>tringify/<b>C</b>onsole.log: <b>A</b> <b>P</b>rogrammer's <b>E</b>ditor</h1>
        <Editor onchange={this.onchange} onkeydown={this.onkeydown} editorId="editor" />
        <Button onclick={this.runcode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    )
  } // End render method.
} // End App Component class.

// Targets div on index.html with id of 'x' as entry point for React App Component.
render(<App />, document.getElementById('x'));