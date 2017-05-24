/***************************
 * unlace
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
const unlace = data => {

  // Compare data to blocked expressions.
  switch (data) {

    // Expressions blocked to prevent users from getting too curious.
    case unlace:
    case AssetConsole:
    case assetAsyncOp:
    case onmessage: return 'undefined';
    case console:
    case console.log:
    case console.error:
    case console.erase:
    case console.record: return '(console object restricted)';
    case this: return '(this keyword restricted)';
    case setTimeout: return '(setTimeout function restricted)';
    case setInterval: return '(setInterval function restricted)';

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

// class AssetConsole to serve as monkey patch for console object and send records to recorder.
class AssetConsole {

  // Main constructor method.
  constructor() {

    // Port to send communication to recorder.
    this.port = null;

  } // End main constructor method.

  // Saves given port for communication.
  connect(port) {

    // Set port to given argument.
    this.port = port;

    // Set protocol for receipt of record from recorder. Recorder should be silent.
    this.port.onmessage = msg => console.log(`Unexpected message from recorder: ${msg}`);

  } // End connect method.

  // Log method to be used as monkey patch for console.log. Sends logs to recorder.
  log() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send log to recorder.
    this.port.postMessage(args.map(e => unlace(e)).join(' ') + '\n');

  } // End log method.

  // Error method to be used as monkey patch for console.error. Sends errors to recorder.
  error() {

    // Make array from argumengs to gain native array method functionality.
    const args = Array.from(arguments);

    // Send error to recorder.
    this.port.postMessage('Error: ' + args.map(e => unlace(e)).join(' ') + '\n');

  } // End error method.

} // End AssetConsole class.

/***************************
 * assetAsyncOp
***************************/

// Accept async func => create new func to time and try-catch callback, then post one console output string.
const assetAsyncOp = asyncFunc => (callback, wait) => asyncFunc(() => {

  // Report beginning of async operation back to main script to be timed on execution.
  self.postMessage({ status: 'async' });

  // Try block for callback.
  try {

    // Perfrom callback.
    callback();

    // Report success status to main script.
    self.postMessage({ status: 'success' });

  } // End try block for callback.

  // Catch block for callback.
  catch (err) {

    // Send error message to recorder.
    console.error(err.message);

    // Report failure status to main script.
    self.postMessage({ status: 'failure' });

  } // End catch block for mission code.

}, wait); // End asyncFunc invocation.

// End assetAsyncOp function.

const origConsole = console;

// Monkey patch console object, setTimeout, and setInterval to report to bridge agent appropriately.
[console, setTimeout, setInterval] = [new AssetConsole, assetAsyncOp(setTimeout), assetAsyncOp(setInterval)];

/***************************
* self.onmessage
***************************/

// On receipt of data, eval code and send back one string containing all console output.
self.onmessage = briefing => {

  switch (briefing.data.command) {

    // Received command to connect port.
    case 'port':

      // Connect port in console.
      console.connect(briefing.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to engage in mission.
    case 'execute':

      // Try block for mission code.
      try {

        // Eval mission code.
        eval(briefing.data.mission);

        // Report success status to main script.
        self.postMessage({ status: 'success' });

      } // End try block for mission code.

      // Catch block for mission code.
      catch (err) {

        // Send error message to recorder.
        console.error(err.message);

        // Report failure status to main script.
        self.postMessage({ status: 'failure' });

      } // End catch block for mission code.

      // Break to avoid initiating below protocols if any.
      break;

  } // End switch block evaluating briefing.data.command.

} // End self.onmessage method.
