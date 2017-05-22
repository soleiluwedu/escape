// Stringify data to optimize inspection of JavaScript expressions.
// Function is available on GitHub as a standalone repo.
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

// On receipt of data, eval code and send back one string containing all console.logs.
self.onmessage = briefing => {

  // One string to contain all console.logs in code.
  let log = '';

  // Monkeypatch console.log to simply collect arguments into 'log' variable.
  console.log = (...args) => log += args.map(e => unlace(e)).join(' ') + '\n';

  // Eval code.
  try { eval(briefing.data); }

  // Catch and report error.
  catch (err) { self.postMessage(`Error: ${err.message}\n`); }

  // Post back console.log output if any exists.
  finally { if (log.length) self.postMessage(log); }

  // In between messages received (which occur on Run Code command), monkeypatch console.log
  // to immediately post messages. Otherwise async operations cannot console.log.
  // Trade-off is that infinite loops inside async operations will crash page.
  console.log = (...args) => self.postMessage(args.map(e => unlace(e)).join(' ') + '\n');

};
