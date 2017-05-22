/***************************
 * unlace
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
function unlace(data) {

  // Disallow access to worker context for security.
  if (data === this) return '[restricted]';

  // These data types do not have toString() functionality.
  switch (data) {

    // Return string 'null' to prevent confusing output of actual null value.
    case null: return 'null';

    // Return string 'undefined' to prevent confusing output of actual undefined value.
    case undefined: return 'undefined';

  } // End switch statement checking for null or undefined values.

  // Conditionally stringify according to data type.
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

  } // End switch statement checking data type.

} // End unlace function.

/***************************
 * ConsoleMonkey class
***************************/

// class ConsoleMonkey returns object to collect and report console output.
class ConsoleMonkey {

  // Main constructor method.
  constructor(context) {

    // All log output saved together as one large string.
    this.fullLog = '';

    // Log method to be used as monkeypatch for console.log. Saves logs to this.fullLog.
    this.log = (...args) => this.fullLog += args.map(e => unlace(e)).join(' ') + '\n';

    // Log method to be used as monkeypatch for console.error. Saves errors to this.fullLog.
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

    // Monkeypatch console object and async functions to report to main script appropriately.
    [console, setTimeout, setInterval] = [new ConsoleMonkey, monkeyPatchAsync(setTimeout), monkeyPatchAsync(setInterval)];

    // Report beginning of async operation back to main script to be timed on execution.
    self.postMessage({ action: 'async' });

    // Try callback.
    try { func(); }

    // Catch and report error in callback if any.
    catch (err) { self.postMessage({ action: 'failure', public: `Error in asynchronous callback: ${err.message}\n` }); }

    // Report one string containing all console output compiled together.
    finally { self.postMessage({ action: 'success', public: console.fullLog }); }

  }, wait); // End asyncFunc invocation.

} // End monkeyPatchAsync function.

/***************************
* self.onmessage
***************************/

// On receipt of data, eval code and send back one string containing all console output.
self.onmessage = e => {

  // Monkeypatch console object and async functions to report to main script appropriately.
  [console, setTimeout, setInterval] = [new ConsoleMonkey, monkeyPatchAsync(setTimeout), monkeyPatchAsync(setInterval)];

  // Eval code sent from main script.
  try { eval(e.data); }

  // Catch and report error in code if any.
  catch (err) { self.postMessage({ action: 'failure', public: `Error: ${err.message}\n` }); }

  // Report one string containing all console output compiled together.
  finally { self.postMessage({ action: 'success', public: console.fullLog }); }

} // End self.onmessage.
