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
    case console.fullLog: return '(console object restricted)';
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

// class AssetConsole returns object to collect and report console output.
class AssetConsole {

  // Main constructor method.
  constructor() {

    // All log output saved together as one large string.
    this.record = '';

  } // End main constructor method.

  // Log method to be used as monkey patch for console.log. Saves logs to this.fullLog.
  log() {
    const args = Array.from(arguments);
    this.record += args.map(e => unlace(e)).join(' ') + '\n';
  }

  // Log method to be used as monkey patch for console.error. Saves errors to this.fullLog.
  error() {
    const args = Array.from(arguments);
    this.record += 'Error: ' + args.map(e => unlace(e)).join(' ') + '\n';
  }

  // Erase this.fullLog.
  erase() { this.record = ''; }

} // End AssetConsole class.

/***************************
 * assetAsyncOp
***************************/

// Accept async func => create new func to time and try-catch callback, then post one console output string.
const assetAsyncOp = asyncFunc => (callback, wait) => asyncFunc(() => {

  // Report beginning of async operation back to main script to be timed on execution.
  self.postMessage({ action: 'async' });

  // Try block for callback.
  try {

    // Execute callback.
    callback();

    //  If successful, report one string containing all async callback console output compiled together.
    self.postMessage({ action: 'success', public: console.record });

  } // End try block for callback.

  // Catch and report error in callback if any.
  catch (err) { self.postMessage({ action: 'failure', public: console.record + `Error in asynchronous callback: ${err.message}\n` }); }

  // Erase console.record.
  finally { console.erase(); }

}, wait); // End asyncFunc invocation.

// End assetAsyncOp function.

// Monkey patch console object, setTimeout, and setInterval to report to main script appropriately.
[console, setTimeout, setInterval] = [new AssetConsole, assetAsyncOp(setTimeout), assetAsyncOp(setInterval)];

/***************************
* self.onmessage
***************************/

// !!! Idea: Spawn a second worker. First worker to receive code does not eval it, but
// just spawns a second worker. Then the second worker evals the code and sends live console
// logs to the first worker, so the first worker can collect all console logs that occurred
// before any infinite loops. If the second worker does not report in to the main script,
// the main script kills the second worker and then sends a message to the first worker to
// command it to report back any console logs it received, and then reset its log to an
// empty string to standby for more console logs from the next spawned second worker.
// Make sure the main script is in charge of killing the second worker, not the first worker,
// because the first worker's event loop will be infinitely filled up by any console logs
// inside inifite loops in the second worker. Theoretically, the first worker should never crash,
// because it is only received strings, collecting them into one big string, and reporting
// that string back to the main script. The first worker should report back to the main script
// by the main script asking for it. The main script should ask for it in two scenarios:
// 1) the second worker reports it's done (success OR failure), and 2) the second worker fails
// to report back at all and times out.

// On receipt of data, eval code and send back one string containing all console output.

self.onmessage = briefing => {

  // Try block for code sent from main script.
  try {

    // Eval code sent from main script.
    eval(briefing.data);

    // If successful, report one string containing all console output compiled together.
    self.postMessage({ action: 'success', public: console.record });

  } // End try block for code sent from main script.

  // Catch and report error in code if any.
  catch (err) { self.postMessage({ action: 'failure', public: console.record + `Error: ${err.message}\n` }); }

  // Erase console.record.
  finally { console.erase(); }

} // End self.onmessage method.
