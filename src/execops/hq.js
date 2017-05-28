/***************************
 * ExecOps class
***************************/

/***************************
 * ExecOps API (all lower case method names, as opposed to methods not meant to be part of the API, which are camel case)
 *
 * (ExecOps instance).active() // Returns boolean indicating if code is currently being executed by web workers.
 * (ExecOps instance).newmission(`codeToEvalAsString`) // Use this method to run code that exists in the form one large string to be evaled.
 * (ExecOps instance).onend = function (consoleLogs) {} // Callback to be set by user. Runs on mission end. Is passed all the console.logs as one argument.
 * (ExecOps instance).pressredbutton() // Collects console.logs, kills web workers, makes new web workers, and runds the .onend callback.
 * (ExecOps instance).setdeadline = (number of milliseconds) // Sets the number of milliseconds to wait before deciding that we have an infinite loops.
***************************/

// ExecOps class executes code (to be evaled as a single string) and reports back console.logs and/or errors.
class ExecOps {

  // ExecOps.constructor
  constructor(location = './') {

    // this.location is a string that refers to location of execops folder. If not passed in, './' is used.
    this.location = location;

    // { this.ops object } has two Workers and one MessageChannel, all to live and die together.
    this.ops = {

      // this.ops.asset: Asset Worker that evals code (client-side) to help keep the main script safe.
      asset: null,

      // this.ops.blackbox: Bridge Agent Worker manages Asset operations and records Asset console.logs.
      bridgeagent: null,

      // this.ops.channel: MessageChannel instance that allows Bridge Agent and Asset to communicate.
      channel: null,

    } // End this.ops object

    // { this.hq object } keeps data concerning operations of Bridge Agent and Asset.
    this.hq = {

      // this.hq.assassinID is setTimeout ID of function to kill Bridge Agent / Asset pair.
      assassinID: null,

      // this.hq.active is boolean to indicate if Agent is currently executing mission.
      active: false,

      // this.hq.deadline is Bridge Agent must check in after 'deadline' number of milliseconds, or the pair is killed.
      deadline: 1000,

      // this.hq.records keeps records to be collected as a single string.
      records: '',

      // this.hq.preRecord is text to be shown before next console.log content.
      preRecord: '',

      // this.hq.postRecord is text to be shown after next console.log content.
      postRecord: '',

    } // End this.hq object

    // Deploy agents upon instantiation.
    this.deployAgents();

  } // ExecOps.constructor

  /***************************
   * ExecOps.active
  ***************************/

  // ExecOps.active returns boolean indicating if Bridge Agent / Asset pair is active.
  active = () => {

    // Use this.hq.deployed boolean.
    return this.hq.active;

  } // End ExecOps.active

  /***************************
   * ExecOps.newmission
  ***************************/

  // ExecOps.newmission sends new mission briefing to Bridge Asset to be relayed to Asset.
  newmission = mission => {

    // Send mission briefing to Bridge Agent to relay to Asset.
    this.ops.bridgeagent.postMessage({ command: 'relay', mission: mission });

    // Update headquarters to indicate mission active.
    this.hq.active = true;

    // Put out a hit on the Bridge Agent / Asset pair that will be cancelled if Bridge Agent reports back in time.
    this.jamesBondVillain();

  } // End ExecOps.newmission

  /***************************
   * ExecOps.onend
  ***************************/

  // ExecOps.onend is callback to be run on mission end. It is passed the console.logs as one argument.
  onend = records => {

    // Pass callback to overwrite this default behavior.
    console.log(records);

  } // End ExecOps.onend

  /***************************
   * ExecOps.pressredbutton
  ***************************/

  // ExecOps.pressredbutton assassinates Asset, collects records from Bridge Agent, and instructs Bridge Agent to commit suicide.
  pressredbutton = () => {

    // Eliminate Asset.
    this.ops.asset.terminate();

    // Order Bridge Agent to send final records and commit suicide.
    this.ops.bridgeagent.postMessage({ command: 'burn' });

    // Update headquarters to indicate no active mission.
    this.hq.active = false;

    // Deploy new agents.
    this.deployAgents();

  } // End ExecOps.pressredbutton

  /***************************
   * ExecOps.setdeadline
  ***************************/

  // ExecOps.setdeadline sets how long the Bridge Agent has to report back to avoid death for both Bridge Agent and Asset.
  setdeadline = time => {

    // Time in millisecond to wait before deciding to kill Bridge Agent and Asset.
    this.hq.deadline = time;

  } // End ExecOps.setdeadline

  /***************************
   * ExecOps.orderReport
  ***************************/

  // ExecOps.orderReport sends command to Bridge Agent to report back all console.logs received from Asset.
  orderReport = () => {

    // Post message to Bridge Agent to send back all current records as a single string.
    this.ops.bridgeagent.postMessage({ command: 'send' });

  } // End ExecOps.orderReport

  /***************************
   * ExecOps.finalizeRecords
  ***************************/

  // ExecOps.finalizeRecords combines this.hq.preRecord, records given as argument, and this.hq.postRecord into this.hq.records.
  finalizeRecords = records => {

    // Finalize records by combining them with pre / post records.
    this.hq.records = this.hq.preRecord + records + this.hq.postRecord;

  } // End ExecOps.finalizeRecords

  /***************************
   * ExecOps.clearRecords
  ***************************/

  // ExecOps.clearRecords deletes all mission records from headquarters.
  clearRecords = () => {

    // Set all records and pre / post messages to empty string.
    this.hq.records = this.hq.preRecord = this.hq.postRecord = '';

  } // End ExecOps.clearRecords

  /***************************
   * ExecOps.setActiveStatus
  ***************************/

  // ExecOps.setActiveStatus saves boolean for ExecOps.active() to retrieve to indicate if operations are active.
  setActiveStatus = activeBoolean => {

    // Save given status into this.hq.active.
    this.hq.active = activeBoolean;

  } // End ExecOps.setActiveStatus

  /***************************
   * ExecOps.deployBridgeAgent
  ***************************/

  // ExecOps.deployBridgeAgent creates Bridge Agent Worker to manage Asset operations and record console.logs.
  deployBridgeAgent = () => {

    // Create new Worker to serve as Bridge Agent.
    this.ops.bridgeagent = new Worker(this.location + '/execops/bridgeagent.js');

    // Protocol for receipt of report from Bridge Agent.
    this.ops.bridgeagent.onmessage = report => {

      // Call off the hit.
      this.jamesBondEscapes();

      // switch block evaluating report type
      switch (report.data.type) {

        // Bridge Agent sending records.
        case 'records':

          // Finalize records by combining them with pre / post records.
          this.finalizeRecords(report.data.records);

          // Run this.onend, which can/should be overwritten by passed-in callback (default is to console.log records).
          this.onend(this.hq.records);

          // Erase mission records from headquarters.
          this.clearRecords();

          // Break to avoid initiating below protocols if any.
          break;

        // Bridge Agent reports mission success.
        case 'success':

        // Bridge Agent reports mission failure.
        case 'failure':

          // Update headquarters to indicate no mission is active.
          this.setActiveStatus(false);

          // Obtain records from Bridge Agent.
          this.orderReport();

          // Break to avoid initiating below protocols if any.
          break;

        // Bridge Agent reports asynchronous mission creep.
        case 'async':

          // Update headquarters to indicate mission is active.
          this.setActiveStatus(true);

          // Deploy new assassin that will give Bridge Agent and Asset plenty of time to escape death.
          this.jamesBondVillain();

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block evaluating report type

    } // End ExecOps.ops.bridgeagent.onmessage

  } // End ExecOps.deployBridgeAgent

  /***************************
   * ExecOps.deployAsset
  ***************************/

  // ExecOps.deployAsset creates Asset Worker to execute code.
  deployAsset = () => {

    // Create new Worker to serve as Asset.
    this.ops.asset = new Worker(this.location + '/execops/asset.js');

    // Protocol for receipt of message from Asset. Asset should not be sending messages to headquarters.
    this.ops.asset.onmessage = report => console.log('Unexpected message from Asset: ' + report.data);

  } // End ExecOps.deployAsset

  /***************************
   * ExecOps.connectAgents
  ***************************/

  // ExecOps.connectAgents connects Bridge Agent and Asset.
  connectAgents = () => {

    // Creates new Message Channel for Bridge Agent and Asset.
    this.ops.channel = new MessageChannel;

    // Open port on Bridge Agent for Asset to send console.logs as they are invoked.
    this.ops.bridgeagent.postMessage({ command: 'port' }, [this.ops.channel.port1]);

    // Open port on Asset to send console.logs to Bridge Agent as they are invoked.
    this.ops.asset.postMessage({ command: 'port' }, [this.ops.channel.port2]);

  } // End ExecOps.connectAgents

  /***************************
   * ExecOps.deployAgents
  ***************************/

  // ExecOps.deployAgents deploys Bridge Agent and Asset for initial mission and any asynchronous mission creep.
  deployAgents = () => {

    // Recruit and deploy new Bridge Agent.
    this.deployBridgeAgent();

    // Recruit and deploy new Asset.
    this.deployAsset();

    // Create new Message Channel and send ports to agents.
    this.connectAgents();

  } // End ExecOps.deployAgents

  /***************************
   * ExecOps.jamesBondEscapes
  ***************************/

  // ExecOps.jamesBondEscapes cancels assassination mission.
  jamesBondEscapes = () => {

    // Call off the hit.
    clearTimeout(this.hq.assassinID);

  } // End ExecOps.jamesBondEscapes

  /***************************
   * ExecOps.jamesBondVillain
  ***************************/

  // ExecOps.jamesBondVillain allows Bridge Agent and Asset plenty of time to escape their deaths.
  jamesBondVillain = () => {

    // Save setTimeout ID of jamesBondVillain to allow cancellation.
    this.hq.assassinID = setTimeout(() => {

      // Add time out error to be shown after console.logs.
      this.hq.postRecord = 'Error: Code timed out. Possible infinite loop.\n';

      // Collect final records from Bridge Agent, kill Bridge Agent, and kill Asset.
      this.pressredbutton();

      // Run callback because mission has ended.
      this.onend(this.hq.records);

      // this.hq.deadline is the time in milliseonds in which Bridge Agent must report by.
    }, this.hq.deadline); // End setTimeout invocation.

  } // End ExecOps.jamesBondVillain

} // End ExecOps class

module.exports = ExecOps;