/***************************
 * BlackBox class
***************************/

// class BlackBox contains port to receive messages from asset and record containing all message content. 
class BlackBox {

  // Main constructor method.
  constructor() {

    // Port to receive communication from asset.
    this.port = null;

    // Initialize empty records.
    this.records = '';

  } // End main constructor method.

  // Saves given port for communication.
  connect(port) {

    // Set port to given argument.
    this.port = port;

    // Set protocol for receipt of record from asset to add to records.
    this.port.onmessage = this.collect.bind(this);

  } // End connect method.

  // Collect data into records.
  collect(doc) {

    this.records += doc.data;

  } // End collect method.

  // Erase records.
  burn() {

    // Set records to empty string.
    this.records = '';

  } // End burn method.

} // End BlackBox class.

/***************************
* self.onmessage
***************************/

// Instantiate BlackBox object to receive records from asset.
const box = new BlackBox;

// On receipt of package from the main script.
self.onmessage = package => {

  // switch block evaluating command.
  switch (package.data.command) {

    // Received command to connect port.
    case 'port':

      // Connect port in box.
      box.connect(package.ports[0]);

      // Break to avoid initiating below protocols if any.
      break;

    // Received command to send back records.
    case 'send':

      // Send records to main script.
      self.postMessage(box.records);

      // Erase records.
      box.burn();

      // Break to avoid initiating below protocols if any.
      break;

  } // End switch block evaluating command.

} // End self.onmessage method.
