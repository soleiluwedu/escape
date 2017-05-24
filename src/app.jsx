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

  // Main constructor method.
  constructor(props) {

    // Props included for good practice, not out of necessity.
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

      // Boolean to indicate if there is a deployed asset.
      assetDeployed: false,

      // setTimeout ID of function to kill asset if asset has not checked in recently.
      assassinID: null,

      // Assets must check in after 'deadline' number of milliseconds, or be killed.
      deadline: 1000,

      // String be shown before next console.log content.
      preRecord: '',
  
      // String be shown after next console.log content.
      postRecord: ''

    } // End this.shadowState object.

    // this.ops contains web workers operational data and references.
    this.ops = {

      // Recorder (web worker) receives console.logs on invocation from asset.
      recorder: new Worker('./src/recorder.js'),

      // Asset (web worker) evals code to help keep the main script safe from errors.
      asset: null,

      // Channel allows asset to report console.logs to recorder.
      channel: new MessageChannel

    } // End this.ops object.

    // Open port on recorder for asset to send console.logs as they are invoked.
    this.ops.recorder.postMessage({ command: 'port' }, [this.ops.channel.port1]);

    // Protocol for receipt of record from recorder.
    this.ops.recorder.onmessage = record => {

      // Recorder only sends back console.log output.
      this.renderOutput(record.data);

    } // End this.ops.recorder.onmessage method.

    // Bind methods that will be passed to children components.
    this.onchange = this.onchange.bind(this);
    this.runCode = this.runCode.bind(this);
    this.endCode = this.endCode.bind(this);
    this.renderOutput = this.renderOutput.bind(this);

  } // End main constructor method.

  /***************************
   * App.onchange
  ***************************/

  // Updates Editor Component on every change to editor.
  onchange(e) {

    // Keep track of editor text. May come in handy if code-sharing funtionality is added.
    this.setState({ editorContent: e.target.value });

  } // End onchange method.

  /***************************
   * App.runCode
  ***************************/

  // When "Run Code" button is clicked, clear Output Component and brief asset.
  runCode() {

    // Clear Output Component's content.
    this.renderOutput('');

    // Send Editor Component's content to asset as mission briefing.
    this.briefAsset(this.state.editorContent);

  } // End runCode method.

  /***************************
   * App.endCode
  ***************************/

  // When "End Code" button is clicked, kill asset and put out a PR statement.
  endCode() {

    // End asset's contract in the most permanent manner possible.
    this.killAsset();

    // Release a PR statement.
    this.renderOutput(this.state.outputContent + 'Code ended.\n');

  } // End endCode method.

  /***************************
   * App.renderOutput
  ***************************/

  // Render output to Output Component.
  renderOutput(output) {

    // Add any pre or post messages handed down from this.shadowState.
    const totalOutput = this.shadowState.preRecord + output + this.shadowState.postRecord;

    // Pre and post messages can be wiped after collection.
    this.shadowState.preRecord = this.shadowState.postRecord = '';

    // Show output to user. Output will be single string split on '\n' to make list items.
    this.setState({ outputContent: totalOutput });

  } // End renderOutput method.

  /***************************
   * App.collectRecord
  ***************************/

  // Send command to recorder to send back all records collected.
  collectRecord() {

    // Post message to recorder to send back records as a single string.
    this.ops.recorder.postMessage({ command: 'send' });

  } // End collectRecord method.

  /***************************
   * App.deployAsset
  ***************************/

  // Deploy asset for initial mission and stay deployed for possible asynchronous mission creep.
  deployAsset() {

    // Recruit and deploy asset.
    this.ops.asset = new Worker('./src/asset.js');

    // Update record to indicate that an asset is currently deployed.
    this.ops.assetDeployed = true;

    // Open port on asset to send console.logs as they are invoked to recorder.
    this.ops.asset.postMessage({ command: 'port' }, [this.ops.channel.port2]);

    // Protocol for receipt of report from asset.
    this.ops.asset.onmessage = report => {

      // Call off the hit.
      this.assassinStandDown();

      // Further protocol depends on type of report from asset.
      switch (report.data.status) {

        // Asset reports successful execution of mission.
        case 'success':

        // Asset reports error during execution of mission.
        case 'failure':

          // Obtain record from recorder and publish public aspect of report.
          this.collectRecord();

          // Break to avoid initiating below protocols if any.
          break;

        // Asset reports mission creep (asynchronous operations).
        case 'async':

          // Deploy new assassin.
          this.assassinDeploy();

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block on report.data.action.

    } // End this.ops.asset.onmessage method.

  } // End deployAsset method.

  /***************************
   * App.briefAsset
  ***************************/

  // Brief asset on mission. Deploy new asset first if none are active.
  briefAsset(mission) {

    // If no assets are currently deployed, deploy a new asset.
    if (!this.ops.assetDeployed) this.deployAsset();

    // Send mission briefing to asset.
    this.ops.asset.postMessage({ command: 'execute', mission: mission });

    // Put out a hit on the asset that will be cancelled if asset reports back in time.
    this.assassinDeploy();

  } // End briefAsset method.

  /***************************
   * App.killAsset
  ***************************/

  // Assassinate asset.
  killAsset() {

    // Eliminate asset.
    this.ops.asset.terminate();

    // Update record to indicate no assets currently deployed.
    this.ops.assetDeployed = false;

    // Release public statement to be shown after console.logs.
    this.shadowState.postRecord = 'Error: Code timed out.\n';

    // Send command to recorder to send back console.logs from asset.
    this.collectRecord();

  } // End killAsset method.

  /***************************
   * App.assassinStandDown
  ***************************/

  // Cancel assassination mission.
  assassinStandDown() {

    // Call off the hit.
    clearTimeout(this.shadowState.assassinID);

  } // End assassinStandDown method.

  /***************************
   * App.assassinDeploy
  ***************************/

  // Activate assassin to eliminate asset upon lack of timely report.
  assassinDeploy() {

    // Save setTimeout ID of assassin to allow cancellation.
    this.shadowState.assassinID = setTimeout(() => {

      // Eliminate asset.
      this.killAsset();

    }, this.shadowState.deadline); // End setTimeout invocation.

  } // End assassinDeploy method.

  /***************************
   * App.render
  ***************************/

  // Render code editor (Editor Component) and console output (Output Component).
  render() {
    return (
      <div id="app">
        <h1 id="title"><b>E</b>val/<b>S</b>tringify/<b>C</b>onsole.log: <b>A</b> <b>P</b>rogrammer's <b>E</b>ditor</h1>
        <Editor onchange={this.onchange} onkeydown={this.onkeydown} editorId="editor" />
        <Button onclick={this.runCode} btnClass="btnClass" btnID="runcode" text="Run Code" />
        <Button onclick={this.endCode} btnClass="btnClass" btnID="endcode" text="End Code" />
        <Output content={this.state.outputContent} outputId="output" />
      </div>
    );
  } // End render method.

} // End App Component.

// Targets div on index.html with id of 'x' as entry point for React App Component.
render(<App />, document.getElementById('x'));