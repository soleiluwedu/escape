const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const PORT = 3000;

const expressReporter = require('./expressReporter');
const routeCtrl = require('./routeCtrl');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

// All GET requests redirect to the main page.
app.get('*', expressReporter.request, routeCtrl.get, expressReporter.response);

// All POST requests redirect to the main page.
app.post('*', expressReporter.request, routeCtrl.post, expressReporter.response);

// Use serverside logger to log message with styling.
app.listen(PORT, () => expressReporter.listenPort(PORT));

module.exports = app;
