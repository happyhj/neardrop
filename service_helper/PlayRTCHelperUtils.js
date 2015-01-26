var isArray = require('util').isArray;

var strFormat = function(str){debugger;
	var args = isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.call(arguments, 1),
		len = args.length,
		reg = null,
		i = 0;

	for(; i<len; i++){
		reg = new RegExp('\\{' + i + '\\}', 'g');
		str = str.replace(reg, args[i]);
	}
	return str;
};

function setLog(tag, log){
	var date = new Date();
	var yyyy = date.getFullYear().toString(),
		MM = (date.getMonth() + 1).toString(),
		dd = date.getDate().toString(),
		hh = date.getHours().toString(),
		mm = date.getMinutes().toString(),
		ss = date.getSeconds().toString(),
		ms = date.getMilliseconds();
	
	if(!log){
		log = "";
	}
	
	log = strFormat("[{0}/{1}/{2} {3}:{4}:{5}.{6}] [{7}] {8}", yyyy, function(){
		return (MM[1] ? MM: "0" + MM[0]);
	}, function(){
		return (dd[1] ? dd : "0" + dd[0]);
	}, function(){
		return (hh[1] ? hh : "0" + hh[0]);
	}, function(){
		return (mm[1] ? mm : "0" + mm[0]);
	}, function(){
		return (ss[1] ? ss : "0" + ss[0]);
	}, function(){
		if(ms < 10){
			ms = "00" + ms;
		}
		else if(ms < 100){
			ms = "0" + ms;
		}
		return ms;
	}, tag, log);
	
	console.log(log);
};


function bind(fn, scope){
	if(!fn || !scope){
		throw new Error("Failed to execute 'bind' on 'PlayRTCUtils' : 2 arguments required, but only " + arguments.length + " present.");
	}
	return function(){
		fn.apply(scope, Array.prototype.slice.call(arguments));
	};
};


var Event = function(){
	this.listeners = { };
};
(function(_){
	_.on = function(name, callback, context){
		this.listeners[name] = {
			callback: callback,
			context: context
		};
		return this;
	};

	_.off = function(name, callback, context){
		if (this.listeners[name]) {
			delete this.listeners[name];
		}
		return this;
	};

	_.fire = function(name){
		if (!this.listeners[name]){
			return this;
		}

		var args = Array.prototype.slice.call(arguments, 1),
			listeners = this.listeners[name];

		switch (args.length) {
			case 0: 
				return (ev = listeners).callback.call(ev.context);
			default:
				return (ev = listeners).callback.apply(ev.context, args);
		}

		return this;
	};

	_.clear = function(){
		this.listeners = { };
	};

	_.hasEvent = function(name){
		if(this.listeners[name]){
			return true;
		}
		
		return false;
	};

})(Event.prototype);


function apply(target, copy){
	if(!target || !copy){
		throw new Error("Failed to execute 'apply' on 'PlayRTCUtils' : 2 arguments required, but only " + arguments.length + " present.");
	}
	
	if(typeof copy === "object"){
		if(typeof target === "number" || typeof target === "boolean" || typeof target === "string"){
			target = copy;
			return target;
		}
	}

	var attr = null;
	for(attr in copy){
		if(typeof copy[attr] === "object" && copy[attr] && !copy[attr].hasOwnProperty("length")){
			target[attr] = apply(target[attr] || { }, copy[attr]);
		}
		else{
			target[attr] = copy[attr];
		}
	}
	return target;
};


exports.PlayRTCUtils = {
	strFormat: strFormat,
	setLog: setLog,
	bind: bind,
	apply: apply,
	Event: Event
};
