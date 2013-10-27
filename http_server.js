#!/usr/bin/env node

var http = require('http');
var counter = 0;
var serv = http.createServer(function(req,res) {
    counter += 1;
    res.writeHead(200);
    debugger;
    res.end("Cumulative number of requests: " + counter);
});
var port = 8080;
serv.listen(port);
console.log("Listening at %s", port);
