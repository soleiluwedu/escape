/***************************
 * unlace
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
function unlace(data) {

  // Disallow access for security.
  switch (data) {

    // Expressions blocked to prevent users from getting too curious.
    case unlace:
    case ConsoleMonkey:
    case monkeyPatchAsync:
    case junglePatch:
    case theManInTheYellowHat:  
    case onmessage: return 'undefined';
    case console:
    case console.log:
    case console.error:
    case console.fullLog: return '(console object restricted)';
    case this: return '(this keyword restricted)';
    case setTimeout: return '(setTimeout function restricted)';
    case setInterval: return '(setInterval function restricted)';

  } // End switch block on data for blocked expressions.

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
    catch (err) { self.postMessage({ action: 'failure', public: `Error in asynchronous callback: ${err.message}\n` }); }

    // Restore all monkey patched functions.
    finally { theManInTheYellowHat(); }

  }, wait); // End asyncFunc invocation.

} // End monkeyPatchAsync function.

/***************************
 * junglePatch
***************************/

// junglePatch function monkey patches console object, setTimeout, and setInterval.
function junglePatch() {

  // Save originals of functions that assets are trained to monkey patch.
  [origConsole, origSetTimeout, origSetInterval] = [console, setTimeout, setInterval];

  // Monkey patch console object and async functions to report to main script appropriately.
  [console, setTimeout, setInterval] = [new ConsoleMonkey, monkeyPatchAsync(setTimeout), monkeyPatchAsync(setInterval)];

} // End junglePatch function.

/***************************
 * theManInTheYellowHat
***************************/

// Restore functions that assets are trained to monkey patch. Named after Curious George's caretaker.
function theManInTheYellowHat() {

  // Restore console object and asynchronous functions setTimeout and setInterval.
  [console, setTimeout, setInterval] = [origConsole, origSetTimeout, origSetInterval];

} // End theManInTheYellowHat function.

/***************************
* self.onmessage
***************************/

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
  catch (err) { self.postMessage({ action: 'failure', public: `Error: ${err.message}\n` }); }

  // Restore all monkey patched functions.
  finally { theManInTheYellowHat(); }

} // End self.onmessage.
