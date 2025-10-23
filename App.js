const express = require('express'); //import express server
app = express()

app.use(express.static('view/html'));

exports.app = app;