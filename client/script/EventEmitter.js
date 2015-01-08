function EventEmitter() {
	this.events = [];
}
EventEmitter.prototype.on = function(fn) {
	this.events.push(fn);
};
EventEmitter.prototype.off = function(fn) {
	var newEvents = [];
	for (var i=0, len=this.events.length; i<len; ++i) {
		var curEvent = this.events[i];
		if (curEvnet !== fn) {
			newEvents.push(curEvnet);
		}
	}
	this.events = newEvents;
};
EventEmitter.prototype.trigger = function() {

	for (var i=0, len=this.events.length; i<len; ++i) {
		this.events[i](arguments);
	}
};