var async = require('async');
var uu = require('underscore');
var sleep = require('sleep');

var Timer = function(name){
    return {
        name: name,
        tstart: null,
        tend: null,
        dt: null,
	start: function() {
	    this.tstart = new Date();
	    console.log("%s start at %s", this.name, this.tstart);
	},
	end: function() {
	    this.tend = new Date();
	    console.log("%s end at %s", this.name, this.tend);
	},
	elapsed: function() {
	    this.end();
	    this.dt = this.tend.valueOf() - this.tstart.valueOf();
	    console.log("%s elapsed time: %s ms", this.name, this.dt);
	}
    };
};

var build_insts = function(nn) {
    var bingit = function(xx) { return 'http://www.bing.com/search?q=' + xx;};
    var urls = uu.map(uu.range(nn), bingit);
    var delays_ms = uu.map(uu.range(nn), function() {
        return Math.random()*1000;
    });
    var to_inst = function(url_delay_pair) {
        return uu.object(uu.zip(['url','delay_ms'], url_delay_pair));    
    };
    return uu.map(uu.zip(urls, delays_ms), to_inst);
};

var summarize = function(results) {
    var add = function(aa, bb) {return aa + bb;};
    var sum = function(arr) {return uu.reduce(arr, add);};
    console.log("Sum of times: %s ms", sum(results));
    console.log("Max of times: %s ms", uu.max(results));
};

var synchronous_mock_download = function(inst) {
    var tm = new Timer('  ' + inst.url);
    tm.start();
    var delay_us = inst.delay_ms * 1000;
    sleep.usleep(delay_us);
    tm.elapsed();
    return inst.delay_ms;
};

var synchronous_example = function(insts) {
    var tm = new Timer('Synchronous');
    tm.start();
    var results = [];
    for(var ii = 0; ii < insts.length; ii++){
        results.push(synchronous_mock_download(insts[ii]));
    }
    summarize(results);
    tm.elapsed();
}

var synchronous_example2 = function(insts) {
    var tm = new Timer('Synchronous 2');
    tm.start();
    summarize(uu.map(insts, synchronous_mock_download));
};

var asynchronous_mock_download = function(inst, cb) {
    var tm = new Timer('  ' + inst.url);
    tm.start();
    var delayfn = function() {
        tm.elapsed();
	cb(null, inst.delay_ms);
    };
    setTimeout(delayfn, inst.delay_ms);
};

var asynchronous_example = function(insts) {
    var tm = new Timer('Asynchronous');
    tm.start();
    
    var async_summarize = function(err, results) {
	summarize(results);
	tm.elapsed();
    };

    async.map(insts, asynchronous_mock_download, async_summarize);
}



var main = function() {
    var nn=5;
    var insts = build_insts(nn);
    synchronous_example(insts);
    synchronous_example2(insts);
    asynchronous_example(insts);
}();
