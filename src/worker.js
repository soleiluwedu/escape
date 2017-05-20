// Stringify data. Function is available o
function unlace(data) {

  // These data types do not have toString() functionality.
  switch (data) {
    case undefined: return 'undefined';
    case null: return 'null';
  }

  // Stringify conditionalÍly and possibly recursively according to data type.
  switch (typeof data) {

    case 'object':
      // Recursive stringify any nested Array instances.
      if (Array.isArray(data)) return `[${data.map(e => unlace(e)).join(', ')}]`;
      // Recursive stringify any nested Object literals.
      else return `{ ${Object.keys(data).map(key => key + ": " + unlace(data[key])).join(', ')} }`;

    // Strings need quotes.
    case 'string': return `'${data}'`;

    // All others, including Functions, will be stringified with toString().
    default: return data.toString();

  }

}

// On receipt of data, eval code and send back one string containing all console.logs.
self.addEventListener("message", function (e) {

  // Save original console.log.
  console.origLog = console.log;

  // One string to contain all console.logs in code.
  let log = '';

  // Monkeypatch console.log to collect arguments passed into it.
  console.log = (...args) => log += args.map(e => unlace(e)).join(' ') + '\n';

  // Eval code.
  try { eval(e.data); }

  // Catch errors.
  catch (err) { var error = err.message; }

  // Sending either error or console.log outputs back to main script.
  finally { e.srcElement.postMessage(error ? error : log); }

  // Restore console.log.
  console.log = console.origLog;

});
