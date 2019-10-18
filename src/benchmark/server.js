
import express from 'express';
var app = express();
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

// var http = require('http')
// http.createServer((req, res) => {
//     res.end('Hello World')
// }).listen(3000)