/***************************
 * ExecOps class
***************************/

// ExecOps class executes code (to be evaled as a single string) and reports back console.logs and/or errors.
class ExecOps {

  // ExecOps.constructor
  constructor(location = './') {

    // this.location is a string that refers to location of execops folder. If not passed in, './' is used.
    this.location = location;

    // this.ops object has two Workers and one MessageChannel, all to live and die together.
    this.ops = {

      // this.ops.asset: Asset Worker that evals code (client-side) to help keep the main script safe.
      asset: null,

      // this.ops.blackbox: Bridge Agent Worker manages Asset operations and records Asset console.logs.
      bridgeagent: null,

      // this.ops.channel: MessageChannel instance that allows Bridge Agent and Asset to communicate.
      channel: null,

    } // End this.ops object

    // this.hq object keeps data concerning operations of Bridge Agent and Asset.
    this.hq = {

      // this.hq.assassinID is setTimeout ID of function to kill Bridge Agent-Asset pair.
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
   * ExecOps.runcallback
  ***************************/

  // this.onend is callback that is passed Asset console.logs as argument. Defaults to console.logging.
  onend = records => console.log(records);

  /***************************
   * ExecOps.collectRecords
  ***************************/

  // ExecOps.collectRecords sends command to Bridge Agent to send back all console.logs received from Asset.
  collectRecords = () => {

    // Post message to Bridge Agent to send back all current records as a single string.
    this.ops.bridgeagent.postMessage({ command: 'send' });

  } // End ExecOps.collectRecords

  /***************************
   * ExecOps.deployBridgeAgent
  ***************************/

  // ExecOps.deployBridgeAgent creates Bridge Agent Worker to manage Asset operations and record console.logs.
  deployBridgeAgent = () => {

    // Create new Worker to serve as Bridge Agent.
    this.ops.bridgeagent = new Worker(this.location + 'execops/bridgeagent.js');

    // Protocol for receipt of report from Bridge Agent.
    this.ops.bridgeagent.onmessage = report => {

      // Call off the hit.
      this.jamesBondEscapes();

      // Further protocol depends on type of report from Bridge Agent.
      switch (report.data.type) {

        // Bridge Agent sending records.
        case 'records':

          // Update headquarters to indicate no mission is active.
          this.hq.active = false;

          // Save records.
          this.hq.records = this.hq.preRecord + report.data.records + this.hq.postRecord;

          // Run this.onend, which can/should be set as callback (defaults to console.logging records).
          this.onend(this.hq.records);

          // Clear records.
          this.sanitize();

          // Break to avoid initiating below protocols if any.
          break;

        // Bridge Agent reports mission success.
        case 'success':

        // Bridge Agent reports mission failure.
        case 'failure':

          // Update headquarters to indicate no mission is active.
          this.hq.active = false;

          // Obtain records from Bridge Agent.
          this.collectRecords();

          // Break to avoid initiating below protocols if any.
          break;

        // Bridge Agent reports asynchronous mission creep.
        case 'async':

          // Deploy new assassin that will give Bridge Agent and Asset plenty of time to escape death.
          this.jamesBondVillain();

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block on report.data.type

    } // End ExecOps.ops.bridgeagent.onmessage

  } // End ExecOps.deployBridgeAgent

  /***************************
   * ExecOps.getrecords
  ***************************/

  // ExecOps.getrecords returns all records from last operation.
  getrecords = () => {

    // Send out records from headquarters.
    return this.hq.records;

  } // End ExecOps.getrecords

  /***************************
   * ExecOps.sanitize
  ***************************/

  // ExecOps.sanitize returns all records from last operation.
  sanitize = () => {

    // Delete all records from headquarters.
    this.hq.records = '';
    this.hq.preRecord = '';
    this.hq.postRecord = '';

  } // End ExecOps.sanitize

  /***************************
   * ExecOps.deployAsset
  ***************************/

  // ExecOps.deployAsset creates Asset Worker to execute code.
  deployAsset = () => {

    // Create new Worker to serve as Asset.
    this.ops.asset = new Worker(this.location + 'execops/asset.js');

    // Protocol for receipt of report from Asset. Asset should not be sending messages to headquarters.
    this.ops.asset.onmessage = report => console.log('Unexpected message from Asset: ' + report.data);

  } // End ExecOps.deployAsset

  /***************************
   * ExecOps.connectAgents
  ***************************/

  // Connect recorder and asset.
  connectAgents = () => {

    // Creates new Message Channel for recorder and asset.
    this.ops.channel = new MessageChannel;

    // Open port on recorder for asset to send console.logs as they are invoked.
    this.ops.bridgeagent.postMessage({ command: 'port' }, [this.ops.channel.port1]);

    // Open port on asset to send console.logs to recorder as they are invoked.
    this.ops.asset.postMessage({ command: 'port' }, [this.ops.channel.port2]);

  } // End ExecOps.connectAgents

  /***************************
   * ExecOps.deployAgents
  ***************************/

  // ExecOps.deployAgents deploys Asset for initial mission and any possible asynchronous mission creep.
  deployAgents = () => {

    // Recruit and deploy new Bridge Agent.
    this.deployBridgeAgent();

    // Recruit and deploy new Asset.
    this.deployAsset();

    // Create new Message Channel and send ports to both agents.
    this.connectAgents();

  } // End ExecOps.deployAgents

  /***************************
   * ExecOps.operating
  ***************************/

  // ExecOps.operating returns boolean indicating if Bridge Agent / Asset pair is active.
  active = () => {

    // Use this.hq.deployed boolean.
    return this.hq.active;

  } // End ExecOps.operating

  /***************************
   * ExecOps.newmission
  ***************************/

  // Brief asset on mission.
  newmission = mission => {

    // Send mission briefing to Bridge Agent.
    this.ops.bridgeagent.postMessage({ command: 'execute', mission: mission });

    // Update headquarters to indicate mission active.
    this.hq.active = true;

    // Put out a hit on the Bridge Agent / Asset pair that will be cancelled if Bridge Agent reports back in time.
    this.jamesBondVillain();

  } // End ExecOps.newmission

  /***************************
   * ExecOps.endops
  ***************************/

  // Exec.ops.endops assassinates Asset, collect records from Bridge Agent, and instruct Bridge Agent to commit suicide.
  endops = () => {
    console.log('HQ => Killing Operations.');

    // Eliminate Asset.
    this.ops.asset.terminate();

    // Send command to Bridge Agent to send back console.logs.
    this.collectRecords();

    // Order Bridge Agent to send final records and commit suicide.
    this.ops.bridgeagent.postMessage({ command: 'burn' });

    // Update headquarters to indicate no mission is active.
    this.hq.active = false;

    // Release public statement to be shown after console.logs.
    this.hq.postRecord = 'Error: Code timed out.\n';

    // Redeploy new agents.
    this.deployAgents();

  } // End ExecOps.endops

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

      // Collect final records from Bridge Agent, kill Bridge Agent, and kill Asset.
      this.endops();

      // Run callback.
      this.onend(this.hq.records)

    }, this.hq.deadline); // End setTimeout invocation.

  } // End ExecOps.jamesBondVillain

} // End ExecOps class

module.exports = ExecOps;