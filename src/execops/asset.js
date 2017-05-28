/***************************
 * Thai's unlace function
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
const unlace = data => {

  // Compare data to blocked expressions.
  switch (data) {

    // Expressions blocked.
    case unlace:
    case AssetConsole:
    case assetAsyncOp:
    case console.async:
    case console.connect:
    case console.success:
    case console.failure:
    case onmessage: return 'undefined';
    case this: return '[object Window]';
    case console: return '[object Console]'
    case console.log: return 'ƒ log()'
    case console.error: return 'ƒ error()'
    case setTimeout: return 'ƒ setTimeout()';
    case setInterval: return 'ƒ setInterval()';

  } // End switch comparing data to blocked expressions.

  // Compare data to null or undefined, as these data types do not have toString() functionality.
  switch (data) {

    // Return string 'null' to prevent confusing output of actual null value.
    case null: return 'null';

    // Return string 'undefined' to prevent confusing output of actual undefined value.
    case undefined: return 'undefined';

  } // End switch statement comparing data to null or undefined.

  // Compare typeof data to different JavaScript data types.
  switch (typeof data) {

    // Objects will be stringified recursively.
    case 'object':

      // Recursively stringify any nested Array instances.
      if (Array.isArray(data)) return `[${data.map(e => unlace(e)).join(', ')}]`;

      // Recursively stringify any nested Object literals.
      else return `{ ${Object.keys(data).map(key => key + ": " + unlace(data[key])).join(', ')} }`;

    // Strings get wrapped in quotes to be distinguished from other data types.
    case 'string': return `'${data}'`;

    // All others will be stringified with toString().
    default: return data.toString();

  } // End switch statement comparing typeof data to different JavaScript data types.

} // End unlace function.

/***************************
 * assetAsyncOp
***************************/

// Accept async func => create new func to time and try-catch callback, then post one console output string.
const assetAsyncOp = asyncFunc => (callback, wait) => asyncFunc(() => {

  // Report beginning of async operation back to Bridge Agent.
  console.async();

  // Try block for callback.
  try {

    // Perfrom callback.
    callback();

    // Report success status to Bridge Agent. Only occurs if no error encountered while executing callback.
    console.success();

  } // End try block for callback.

  // Catch block for callback.
  catch (err) {

    // Send error message to Bridge Agent.
    console.error(err.message);

    // Report failure status to Bridge Agent.
    console.failure();

  } // End catch block for callback.

}, wait); // End asyncFunc invocation.

// End assetAsyncOp function.

/***************************
 * AssetConsole class
***************************/

// class AssetConsole to serve as monkey patch for console object and send records to Bridge Agent.
class AssetConsole {

  // AssetConsole.constructor
  constructor() {

    // Port to send communication to Bridge Agent.
    this.bridgeAgentPort = null;

  } // End AssetConsole.

  /***************************
   * AssetConsole.async
  ***************************/

  // AssetConsole.async reports asynchronous mission creep to Bridge Agent.
  async() {

    // Report beginning of async code execution to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'async' });

  } // End AssetConsole.async

  /***************************
   * AssetConsole.connect
  ***************************/

  // AssetConsole.connect sets port to communicate with Bridge Agent.
  connect(port) {

    // Set port to given argument.
    this.bridgeAgentPort = port;

    // Set protocol for receipt of record from Bridge Agent.
    this.bridgeAgentPort.onmessage = dossier => {

      // Switch block evaluating orders in dossier.
      switch (dossier.data.command) {

        // Received command to engage in mission.
        case 'execute':

          // Try block for mission code.
          try {

            // Eval mission code.
            eval(dossier.data.mission);

            // Report success status to Bridge Agent.
            this.success();

          } // End try block for mission code.

          // Catch block for mission code.
          catch (err) {

            // Send error message to Bridge Agent.
            this.error(err.message);

            // Report failure status to Bridge Agent.
            this.failure();

          } // End catch block for mission code.

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block evaluating orders in dossier.

    } // End AssetConsole.port.onmessage

  } // End AssetConsole.connect

  /***************************
   * AssetConsole.error
  ***************************/

  // AssetConsole.error sends errors to Bridge Agent.
  error() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send error to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'adderr', record: 'Error: ' + args.map(e => unlace(e)).join(' ') + '\n' });

  } // End AssetConsole.error

  /***************************
   * AssetConsole.failure
  ***************************/

  // AssetConsole.failure reports failure status to Bridge Agent.
  failure() {

    // Report failure status to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'failure' });

  } // End AssetConsole.failure

  /***************************
   * AssetConsole.log
  ***************************/

  // AssetConsole.log sends console.logs to Bridge Agent.
  log() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send log to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'addlog', record: args.map(e => unlace(e)).join(' ') + '\n' });

  } // End AssetConsole.log

  /***************************
   * AssetConsole.success
  ***************************/

  // AssetConsole.success reports success status to Bridge Agent.
  success() {

    // Report success status to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'success' });

  } // End AssetConsole.success

} // End AssetConsole class.

/***************************
 * Jungle Patch
***************************/

// Monkey patch console object, setTimeout, and setInterval to report to Bridge Agent appropriately.
[console, setTimeout, setInterval] = [new AssetConsole, assetAsyncOp(setTimeout), assetAsyncOp(setInterval)];

/***************************
 * self.onmessage
***************************/

// self.onmessage serves as protocol for receipt of dossier from headquarters.
self.onmessage = dossier => {

  // Switch block evaluating orders in dossier.
  switch (dossier.data.command) {

    // Received command to connect port to Bridge Agent.
    case 'port':

      // Connect port in console.
      console.connect(dossier.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

  } // End switch block evaluating orders in dossier.

} // End self.onmessage
