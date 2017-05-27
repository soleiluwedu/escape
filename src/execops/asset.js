/***************************
 * unlace
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
    case console.log: return 'function log() { [native code] }'
    case console.error: return 'function error() { [native code] }'
    case setTimeout: return 'function setTimeout() { [native code] })';
    case setInterval: return 'function setInterval() { [native code] }';

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
 * AssetConsole class
***************************/

// class AssetConsole to serve as monkey patch for console object and send records to Bridge Agent.
class AssetConsole {

  // AssetConsole.constructor
  constructor() {

    // Port to send communication to Bridge Agent.
    this.port = null;

  } // End AssetConsole.

  /***************************
   * AssetConsole.connect
  ***************************/

  // AssetConsole.connect sets port to communicate with Bridge Agent.
  connect(port) {

    // Set port to given argument.
    this.port = port;

    // Set protocol for receipt of record from Bridge Agent.
    this.port.onmessage = dossier => {
      origConsole.log('ASSET => Received from BRIDGE AGENT: ' + dossier.data.command);
      origConsole.log('ASSET => Mission received from BRIDGE AGENT: ' + dossier.data.mission);

      // Evaluate orders in dossier.
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
   * AssetConsole.log
  ***************************/

  // AssetConsole.log sends console.logs to Bridge Agent.
  log() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send log to Bridge Agent.
    this.port.postMessage({ type: 'addlog', record: args.map(e => unlace(e)).join(' ') + '\n' });

  } // End AssetConsole.log

  /***************************
   * AssetConsole.error
  ***************************/

  // AssetConsole.error sends errors to Bridge Agent.
  error() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send error to Bridge Agent.
    this.port.postMessage({ type: 'adderr', record: 'Error: ' + args.map(e => unlace(e)).join(' ') + '\n' });

  } // End AssetConsole.error

  /***************************
   * AssetConsole.success
  ***************************/

  // AssetConsole.success reports success status to Bridge Agent.
  success() {

    // Report success status to Bridge Agent.
    this.port.postMessage({ type: 'success' });

  } // End AssetConsole.success

  /***************************
 * AssetConsole.failure
***************************/

  // AssetConsole.failure reports failure status to Bridge Agent.
  failure() {

    // Report failure status to Bridge Agent.
    this.port.postMessage({ type: 'failure' });

  } // End AssetConsole.failure

  /***************************
* AssetConsole.async
***************************/

  // AssetConsole.async reports asynchronous mission creep to Bridge Agent.
  async() {

    // Report async status to Bridge Agent.
    this.port.postMessage({ type: 'async' });

  } // End AssetConsole.async

} // End AssetConsole class.

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

    // Report success status to Bridge Agent.
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
 * Jungle Patch
***************************/

origConsole = console;

// Monkey patch console object, setTimeout, and setInterval to report to bridge agent appropriately.
[console, setTimeout, setInterval] = [new AssetConsole, assetAsyncOp(setTimeout), assetAsyncOp(setInterval)];

/***************************
 * self.onmessage
***************************/

// Protocol for receipt of dossier from headquarters. HQ communication is limited.
self.onmessage = dossier => {
  origConsole.log('ASSET => Received from HQ: ' + dossier.data.command);

  // Evaluate orders in dossier.
  switch (dossier.data.command) {

    // Received command to connect port to Bridge Agent.
    case 'port':

      // Connect port in console.
      console.connect(dossier.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to commit suicide.
    case 'burn':

      // Close Asset operations permanently.
      self.close()

  } // End switch block evaluating dossier.data.command.

} // End self.onmessage
