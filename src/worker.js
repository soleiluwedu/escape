// Stringify data. Function is available on GitHub as a standalone repo.
function unlace(data) {

  // These data types do not have toString() functionality.
  switch (data) {
    case undefined: return 'undefined';
    case null: return 'null';
  }

  // Conditionally stringify according to data type.
  switch (typeof data) {

    case 'object':
      // Recursively stringify any nested Array instances.
      if (Array.isArray(data)) return `[${data.map(e => unlace(e)).join(', ')}]`;
      // Recursively stringify any nested Object literals.
      else return `{ ${Object.keys(data).map(key => key + ": " + unlace(data[key])).join(', ')} }`;

    // Strings get wrapped in quotes to be distinguished from other data types.
    case 'string': return `'${data}'`;

    // All others will be stringified with toString().
    default: return data.toString();

  }

}

// On receipt of data, eval code and send back one string containing all console.logs.
self.addEventListener("message", e => {

  // Save original functions.
  console.origLog = console.log;
  origSetTimeout = setTimeout;
  origSetInterval = setInterval;

  // One string to contain all console.logs in code.
  let log = '';

  // Monkeypatch console.log to collect arguments and post message containing all arguments.
  console.log = (...args) => log += args.map(e => unlace(e)).join(' ') + '\n';

  // Monkeypatch setTimeout to call another web worker to eval callback.
  setTimeout = (func, wait) => origSetTimeout(() => e.srcElement.postMessage({ action: 'spawn', content: `(${func})()` }), wait);

  // Monkeypatch setInterval to call another web worker to eval callback.
  setInterval = (func, wait) => origSetTimeout(() => e.srcElement.postMessage({ action: 'spawnInterval', content: `(${func})()`, wait: wait }), wait);

  try {
    // Eval code.
    eval(e.data);
    // Post all console.log content as message.
    e.srcElement.postMessage({ action: 'addline', content: log });
  }

  // Catch errors.
  catch (err) { e.srcElement.postMessage({ action: 'addline', content: `Error: ${err.message}\n` }); }

  // Notify main script that worker is finished.
  finally { e.srcElement.postMessage({ action: 'finish' }); }

});
