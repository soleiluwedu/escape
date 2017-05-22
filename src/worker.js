/***************************
 * unlace
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
function unlace(data) {

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
 * ConsoleLog class
***************************/

// class ConsoleLog accepts context (which will be 'this') and returns object functions so console.log can be monkeypatched.
function ConsoleLog(context) {

  // Expressions restricted from being logged. Pass in 'this' to be referred to as 'context' in class methods.
  this.restricted = [context];

  // All log output saved together as one large string.
  this.fullLog = '';

  // Log method to be used as monkeypatch for console.log. Saves logs to this.fullLog.
  this.log = (...args) => this.fullLog += args.map(e => this.restricted.indexOf(e) > -1 ? '[Restricted]' : unlace(e)).join(' ') + '\n';

} // End ConsoleLog class.

/***************************
 * monkeyPatchAsync
***************************/

// Accept async func => create new func to time and try-catch callback, then post one console.log output string.
const monkeyPatchAsync = asyncFunc => (func, wait) => {

  // Return original asynchronous function so any ID (like setTimeout ID or setInterval ID) is returned.
  return asyncFunc(() => {

    // Instantiate new instance of ConsoleLog class to monkeypatch async console.log invocations.
    const asyncLog = new ConsoleLog(this);

    // Monkeypatch console.log in async callback to collect all console.logs into one string.
    console.log = asyncLog.log;

    // Report beginning of async operation back to main script to be timed on execution.
    self.postMessage({ action: 'async' });

    // Try callback.
    try { func(); }

    // Catch and report error in callback if any.
    catch (err) { self.postMessage({ action: 'failure', content: `Error in asynchronous callback: ${err.message}\n` }); }

    // Report one string containing all console.logs compiled together.
    finally { self.postMessage({ action: 'success', content: asyncLog.fullLog }); }

  }, wait); // End asyncFunc invocation.

} // End monkeyPatchAsync function.

/***************************
* self.onmessage
***************************/

// On receipt of data, eval code and send back one string containing all console.logs.
self.onmessage = e => {

  // Instantiate new instance of ConsoleLog class to monkeypatch worker console.log invocations.
  const workerLog = new ConsoleLog(this);

  // Monkeypatch console.log to send back one string containing all worker console.logs.
  console.log = workerLog.log;

  // Monkeypatch setTimeout to try-catch callback and send one string of all callback console.logs.
  setTimeout = monkeyPatchAsync(setTimeout);

  // Monkeypatch setInterval to try-catch callback and send one string of all callback console.logs.
  setInterval = monkeyPatchAsync(setInterval);

  // Eval code sent from main script.
  try { eval(e.data); }

  // Catch and report error in code if any.
  catch (err) { self.postMessage({ action: 'failure', content: `Error: ${err.message}\n` }); }

  // Report one string containing all console.logs compiled together.
  finally { self.postMessage({ action: 'success', content: workerLog.fullLog }); }

} // End self.onmessage.
