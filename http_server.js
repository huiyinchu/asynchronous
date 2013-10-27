#!/usr/bin/env node

var http = require('http');
var counter = 0;
var serv = http.createServer(function(req,res) {
    if(req.url != "/favicon.ico"){
	counter += 1;
    	res.writeHead(200);
    	res.end("Cumulative number of requests: " + counter);
    }
});
var port = 8080;
serv.listen(port);
console.log("Listening at %s", port);
