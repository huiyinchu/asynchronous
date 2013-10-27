var uu = require('underscore');
var async = require('async');
var request = require('request');

var _data = {};
var DEBUG = true;

var log = function(xx) {
    if(DEBUG) {
	console.log("%s at %s", xx, new Date());
    }
};

function save(inst, name) {
    if(DEBUG) { global._data[name] = inst; }
}

function mod_data2modname_stability(mod_data) {
    var crypto_regex = /crypto/;
    var stability_regex = /Stability: (\d)/;
    var name_regex = /doc\/api\/(\w+).markdown/;
    var modname = name_regex.exec(mod_data.source)[1];
    var stability;
    try {
	if(crypto_regex.test(modname)) {
	    var stmp = stability_regex.exec(mod_data.modules[0].desc)[1];
	    stability = parseInt(stmp, 10);
	}
	else if(uu.has(mod_data, 'stability')) {
	    stability = mod_data.stability;
	}
	else if(uu.has(mod_data, 'miscs')) {
	    stability = mod_data.miscs[0].miscs[1].stability;
	}
	else if(uu.has(mod_data, 'modules')) {
	    stability = mod_data.modules[0].stability;
	}
	else if(uu.has(mod_data, 'globals')) {
	    stability = mod_data.globals[0].stability;
	} else {
	    stability = undefined;
	}
    }

    catch(e) {
	stability = undefined;
    }
    return {"modname": modname, "stability": stability};
}

function mod_datas2stability_to_names(mod_datas, cb) {
    log(mod_datas);
    log(arguments.callee.name);
    modname_stabilities = uu.map(mod_datas, mod_data2modname_stability);
    var stability_to_names = {};
    for(var ii in modname_stabilities) {
	var ms = modname_stabilities[ii];
	var nm = ms.modname;
	if(uu.has(stability_to_names, ms.stability)) {
	    stability_to_names[ms.stability].push(nm);
	} else{
	    stability_to_names[ms.stability] = [nm];
	}
    }
    cb(null, stability_to_names);
}

function mod_url2mod_data(mod_url, cb) {
    log(arguments.callee.name);
    var err_resp_body2mod_data = function(err, resp, body) {
	if(!err && resp.statusCode == 200) {
	    var mod_data = JSON.parse(body);
	    cb(null, mod_data);
	}	
    };
    request(mod_url, err_resp_body2mod_data);
}

function mod_urls2mod_datas(mod_urls, cb) {
    log(arguments.callee.name);
    var NUM_DOWNLOADS = 36;
    async.mapLimit(mod_urls, NUM_DOWNLOADS, mod_url2mod_data, cb);
}

function index_data2mod_urls(index_data, cb) {
    log(arguments.callee.name);
    var notUndefined = function(xx) {return !uu.isUndefined(xx);};
    var modnames = uu.filter(uu.pluck(index_data.desc, 'text'), notUndefined);
    var modname2mod_url = function(modname) {
	var modregex = /\[([^\]]+)\]\(([^\)]+).html\)/;
	var shortname = modregex.exec(modname)[2];
	return 'http://node.js.org/api/' + shortname + ' . json';
    };
    var mod_urls = uu.map(modnames, modname2mod_url);
    cb(null, mod_urls);
}

function index_url2index_data(index_url, cb) {
    log(arguments.callee.name);
    var err_resp_body2index_data = function(err, resp, body) {
	if(!err && resp.statusCode == 200){
	    var index_data = JSON.parse(body);
	    cb(null, index_data);
	}	    
    };
    request(index_url, err_resp_body2index_data);
}

function stability_to_names2console(err, stability_to_names) {
    log(arguments.callee.name); //callee is a property of the arguments object
    console.log(JSON.stringify(stability_to_names, null, 2)); //Convert a value to JSON
}

var index_url2console = async.compose(mod_datas2stability_to_names,
				      mod_urls2mod_datas,
				      index_data2mod_urls,
				      index_url2index_data);
//async.compose to help async

var index_url = "http://nodejs.org/api/index.json";
index_url2console(index_url, stability_to_names2console);
