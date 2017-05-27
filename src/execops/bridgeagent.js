/***************************
 * BlackBox class
***************************/

// class BlackBox contains port to receive messages from asset and string containing Asset console.logs. 
class BlackBox {

  // BlackBox.constructor
  constructor() {

    // Port to receive communication from asset.
    this.port = null;

    // Initialize empty vault to begin saving console.logs sent from Asset.
    this.vault = '';

  } // End BlackBox.constructor

  /***************************
   * BlackBox.connect
  ***************************/

  // BlackBox.connect sets port to allow communication from Asset.
  connect(port) {

    // Set port to given argument.
    this.port = port;

    // Protocol for receipt of record from Asset.
    this.port.onmessage = report => {

      // Evaluating report type.
      switch (report.data.type) {

        // Asset is adding a console.log to the records.
        case 'addlog':

        // Asset is adding a console.error to the records.
        case 'adderr':

          // Add record from Asset to vault.
          this.record(report.data.record);

          // Break to avoid initiating below protocols if any.
          break;

        // Asset reports mission success.
        case 'success':

        // Asset reports mission failure.
        case 'failure':

        // Asset reports asynchronous mission creep.
        case 'async':

          // Report mission status to headquarters.
          self.postMessage({ type: report.data.type })

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block evaluating report type.

    } // End AssetConsole.port.onmessage

  } // End BlackBox.connect

  /***************************
   * BlackBox.relay
  ***************************/

  // Box.relay relays mission briefing to Asset.
  briefAsset(mission) {

    // Add record to this.cache.
    this.port.postMessage({ command: 'execute', mission: mission });

  } // End Box.relay

  /***************************
   * BlackBox.record
  ***************************/

  // Box.record saves data from asset into vault to be collected all at once from headquarters.
  record(recording) {

    // Add record to this.cache.
    this.vault += recording;

  } // End Box.record

  /***************************
   * BlackBox.getrecords
  ***************************/

  // BlackBox.getrecords returns vault contents.
  getrecords() {

    // Return contents of vault.
    return this.vault;

  } // End BlackBox.getrecords

  /***************************
   * BlackBox.sanitize
  ***************************/

  // BlackBox.sanitize empties out the vault so future reports to headquarters do not have duplicate content.
  sanitize() {

    // Set this.vault to empty string.
    this.vault = '';

  } // End BlackBox.sanitize

} // End BlackBox class.

/***************************
 * Black Box instance
***************************/

// Instantiate Black Box object to receive records from asset.
const box = new BlackBox;

/***************************
 * self.onmessage
***************************/

// Protocol for receipt of dossier from headquarters.
self.onmessage = dossier => {
  console.log('BRIDGE AGENT => Received from HQ: ' + dossier.data.command);

  // Evaluate orders in dossier.
  switch (dossier.data.command) {

    // Received command to connect port to Asset.
    case 'port':

      // Connect port in box.
      box.connect(dossier.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to execute new mission.
    case 'execute':

      // Connect port in box.
      box.briefAsset(dossier.data.mission);
      console.log('BRIDGE AGENT => Mission received from HQ: ' + dossier.data.mission);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to send back records.
    case 'send':

      // Send console.logs to headquarters.
      self.postMessage({ type: 'records', records: box.getrecords() });

      // Erase records to prevent duplicate data instances on next send.
      box.sanitize();

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to send back records and commit suicide.
    case 'burn':

      // Send final console.logs to headquarters.
      self.postMessage({ type: 'records', records: box.getrecords() });

      // Commit suicide.
      self.close();

      // Break to avoid initiating below protocols if any.
      break;

  } // End switch block evaluating orders in dossier.

} // End self.onmessage
