/***************************
 * BlackBox class
***************************/

// class BlackBox contains port to receive messages from asset and string containing Asset console.logs. 
class BlackBox {

  // BlackBox.constructor
  constructor() {

    // this.assetPort points to port to receive communication from Asset.
    this.assetPort = null;

    // this.vault stores console.logs sent from Asset.
    this.vault = '';

  } // End BlackBox.constructor

  /***************************
   * BlackBox.connect
  ***************************/

  // BlackBox.connect sets port to allow communication from Asset.
  connect(port) {

    // Set port to given argument.
    this.assetPort = port;

    // Protocol for receipt of record from Asset.
    this.assetPort.onmessage = report => {

      // Switch block evaluating report type
      switch (report.data.type) {

        // Asset is adding a console.log to the records.
        case 'addlog':

        // Asset is adding a console.error to the records.
        case 'adderr':

          // Save record from Asset to vault.
          this.save(report.data.record);

          // Break to avoid initiating below protocols if any.
          break;

        // Asset reports mission success.
        case 'success':

        // Asset reports mission failure.
        case 'failure':

        // Asset reports asynchronous mission creep.
        case 'async':

          // Report mission status to headquarters.
          this.reportstatus(report.data.type);

          // Break to avoid initiating below protocols if any.
          break;

      } // End switch block evaluating report type.

    } // End AssetConsole.port.onmessage

  } // End BlackBox.connect

  /***************************
   * BlackBox.explode
  ***************************/

  // BlackBox.explode kills the Bridge Agent and all his / her operations in a fiery glory.
  explode() {

    // Bridge Agent sets fuse on Black Box's hidden C4 and commits suicide.
    self.close();

  } // End BlacBox.explode

  /***************************
   * BlackBox.erase
  ***************************/

  // BlackBox.erase empties out the vault to prevent duplicate content on subsequent reports.
  erase() {

    // Set this.vault to empty string.
    this.vault = '';

  } // End BlackBox.erase

  /***************************
   * BlackBox.relay
  ***************************/

  // Box.relay relays mission briefing to Asset.
  relay(mission) {

    // Send message to Asset with 'execute' command and mission briefing.
    this.assetPort.postMessage({ command: 'execute', mission: mission });

  } // End Box.relay

  /***************************
   * BlackBox.reportstatus
  ***************************/

  // BlackBox.reportstatus sends report to headquarters to indicate status of operations.
  reportstatus(status) {

    // Report mission status to headquarters.
    self.postMessage({ type: status });

  } // End BlackBox.reportstatus

  /***************************
   * BlackBox.save
  ***************************/

  // Box.save keeps data from asset in vault to be collected all at once from headquarters.
  save(recording) {

    // Add recording to vault.
    this.vault += recording;

  } // End Box.save

  /***************************
   * BlackBox.sendrecords
  ***************************/

  // BlackBox.sendrecords sends vault contents to headquarters and then erases vault contents.
  sendrecords() {

    // Send console.logs to headquarters.
    self.postMessage({ type: 'records', records: this.vault });

    // Erase records to prevent duplicate data instances on next send.
    this.vault = '';

  } // End BlackBox.sendrecords

} // End BlackBox class

/***************************
 * Black Box instance
***************************/

// Instantiate Black Box object to receive records from Asset.
const box = new BlackBox;

/***************************
 * self.onmessage
***************************/

// self.onmessage serves as protocol for receipt of dossier from headquarters.
self.onmessage = dossier => {

  // Evaluate orders in dossier.
  switch (dossier.data.command) {

    // Received command to connect port to Asset.
    case 'port':

      // Connect port in box.
      box.connect(dossier.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to relay mission briefing to Asset.
    case 'relay':

      // Relay mission briefing to Asset.
      box.relay(dossier.data.mission);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to send back records.
    case 'send':

      // Send console.logs to headquarters.
      box.sendrecords();

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to send back records and commit suicide.
    case 'burn':

      // Send final console.logs to headquarters.
      box.sendrecords();

      // Commit suicide.
      box.explode();

      // Break to avoid initiating below protocols if any.
      break;

  } // End switch block evaluating orders in dossier.

} // End self.onmessage
