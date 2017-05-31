/***************************
 * Thai's unlace function
***************************/

// Stringify data to optimize inspection of JavaScript expressions.
const unlace = data => {

  // Compare data to blocked expressions.
  switch (data) {

    // Expressions blocked.
    case unlace:
    case assetAsyncOp:
    case AssetConsole:
    case console.async:
    case console.connect:
    case console.failure:
    case console.logerr:
    case console.success:
    case onmessage: return 'undefined';
    case this: return '[global scope]';
    case console: return '[console object]';
    case console.log: return 'ƒ log()';
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
    console.logerr(err);

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
            this.logerr(err);

            // Report failure status to Bridge Agent.
            this.failure();

          } // End catch block for mission code.

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block evaluating orders in dossier.

    } // End AssetConsole.port.onmessage

  } // End AssetConsole.connect

  /***************************
   * AssetConsole.failure
  ***************************/

  // AssetConsole.failure reports failure status to Bridge Agent.
  failure() {

    // Report failure status to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'failure' });

  } // End AssetConsole.failure

  /***************************
   * AssetConsole.success
  ***************************/

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
   * AssetConsole.logerr
  ***************************/

  // AssetConsole.logerr sends errors to Bridge Agent.
  logerr(err) {

    // If anything other an Error was passed in, then user is attempting to manually use it. Do not allow.
    if (!(err instanceof Error)) throw new TypeError('console.logerr is not a function');

    // Initiate string to serve as error log.
    let errorMsg = err.constructor.name;

    // Below string is always right before the line number.
    const precedesLineNumber = '<anonymous>:';

    // Variables used to break up the err.stack string, in order to identify line number.
    let lineNumberIndex, startingWithLineNumber, lineNumber;

    // Evaluate type of error for errors that have line numbers. SyntaxErrors have no line numbers.
    switch (err.constructor.name) {

      // Type Error
      case 'TypeError':
      
      // Reference Error
      case 'ReferenceError':
        
        // Line number of error is in err.stack and starts immediately after the below string.
        lineNumberIndex = err.stack.indexOf(precedesLineNumber) + precedesLineNumber.length;

        // String from err.stack excluding everything before the line number.
        startingWithLineNumber = err.stack.slice(lineNumberIndex);

        // Line number ends before the first colon.
        lineNumber = startingWithLineNumber.slice(0, startingWithLineNumber.indexOf(':'));

    } // End switch block evaluating type of error.

    // Add line number if lineNumber is truthy (line numbers start with 1, not 0, so it will be truthy if there is one at all).
    if (!!lineNumber) errorMsg += ` on line ${lineNumber}`;

    // Append Error object's message field onto error log.
    errorMsg += `: ${err.message}`;

    // Send error to Bridge Agent.
    this.bridgeAgentPort.postMessage({ type: 'adderr', record: errorMsg + '\n' });

  } // End AssetConsole.logerr

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
