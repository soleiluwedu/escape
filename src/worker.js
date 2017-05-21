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

  // Monkeypatch setInterval to use setTimeout call another web worker to eval callback. This will enforce safety checks on each execution.
  setInterval = (func, wait) => origSetTimeout(() => e.srcElement.postMessage({ action: 'spawnInterval', func: func.toString(), wait }), wait);

  try {
    switch (e.data.command) {
      // Eval code.
      case 'eval': eval(e.data.payload); break;

      // Eval a given function and use the monkeypatched setInterval function to repeact functionality.
      case 'setInterval':
        eval(`(${e.data.func})()`);
        var id = setInterval(e.data.func, e.data.wait);
        break;
    }

    // Post all console.log content as message.
    e.srcElement.postMessage({ action: 'addline', content: log });
  }

  // Catch errors.
  catch (err) { e.srcElement.postMessage({ action: 'addline', content: `Error: ${err.message}\n` }); }

  // Notify main script that worker is finished.
  finally {
    switch (e.data.command) {
      case 'setInterval': return e.srcElement.postMessage({ action: 'finishSetInterval', id, wait: e.data.wait });
      default: return e.srcElement.postMessage({ action: 'finish' });
    }
  }

});
