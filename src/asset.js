/***************************
 * unlace
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
function unlace(data) {

  // Compare data to blocked expressions.
  switch (data) {

    // Expressions blocked to prevent users from getting too curious.
    case unlace:
    case ConsoleMonkey:
    case monkeyPatchAsync:
    case junglePatch:
    case theManWithTheYellowHat:
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
 * ConsoleMonkey class
***************************/

// class ConsoleMonkey returns object to collect and report console output.
class ConsoleMonkey {

  // Main constructor method.
  constructor() {

    // All log output saved together as one large string.
    this.fullLog = '';

    // Log method to be used as monkey patch for console.log. Saves logs to this.fullLog.
    this.log = (...args) => this.fullLog += args.map(e => unlace(e)).join(' ') + '\n';

    // Log method to be used as monkey patch for console.error. Saves errors to this.fullLog.
    this.error = (...args) => this.fullLog += 'Error: ' + args.map(e => unlace(e)).join(' ') + '\n';

  } // End main constructor method.

} // End ConsoleMonkey class.

/***************************
 * monkeyPatchAsync
***************************/

// Accept async func => create new func to time and try-catch callback, then post one console output string.
const monkeyPatchAsync = asyncFunc => (func, wait) => {

  // Return original asynchronous function so any ID (like setTimeout ID or setInterval ID) is returned.
  return asyncFunc(() => {

    // Report beginning of async operation back to main script to be timed on execution.
    self.postMessage({ action: 'async' });

    // Monkey patch console object, setTimeout, and setInterval.
    junglePatch();

    // Try block for async callback.
    try {

      // Execute async callback.
      func();

      //  If successful, report one string containing all async callback console output compiled together.
      self.postMessage({ action: 'success', public: console.fullLog });

    } // End try block for async callback.

    // Catch and report error in callback if any.
    catch (err) { self.postMessage({ action: 'failure', public: console.fullLog + `Error in asynchronous callback: ${err.message}\n` }); }

    // Restore all monkey patched functions.
    finally { theManWithTheYellowHat(); }

  }, wait); // End asyncFunc invocation.

} // End monkeyPatchAsync function.

/***************************
 * junglePatch
***************************/

// junglePatch function monkey patches console object, setTimeout, and setInterval.
function junglePatch() {

  // Save originals of functions that will be monkey patched.
  [origConsole, origSetTimeout, origSetInterval] = [console, setTimeout, setInterval];

  // Monkey patch console object, setTimeout, and setInterval to report to main script appropriately.
  [console, setTimeout, setInterval] = [new ConsoleMonkey, monkeyPatchAsync(setTimeout), monkeyPatchAsync(setInterval)];

} // End junglePatch function.

/***************************
 * theManWithTheYellowHat
***************************/

// Clean up after all the monkey business. Named after Curious George's caretaker.
function theManWithTheYellowHat() {

  // Restore console object and asynchronous functions setTimeout and setInterval.
  [console, setTimeout, setInterval] = [origConsole, origSetTimeout, origSetInterval];

} // End theManWithTheYellowHat function.

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
self.onmessage = e => {

  // Monkey patch console object, setTimeout, and setInterval.
  junglePatch();

  // Try block for code sent from main script.
  try {

    // Eval code sent from main script.
    eval(e.data);

    // If successful, report one string containing all console output compiled together.
    self.postMessage({ action: 'success', public: console.fullLog });

  } // End try block for code sent from main script.

  // Catch and report error in code if any.
  catch (err) { self.postMessage({ action: 'failure', public: console.fullLog + `Error: ${err.message}\n` }); }

  // Restore all monkey patched functions.
  finally { theManWithTheYellowHat(); }

} // End self.onmessage method.
