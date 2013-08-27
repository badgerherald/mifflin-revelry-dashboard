var util = require('util')
,   events = require('events');

function Collector(streamer, emitter) {
    this.streamer = streamer;
    this.emitter = emitter.emit;
}

util.inherits(Collector, events.EventEmitter);

Collector.prototype.stream = function() {
    this.streamer.stream(this.emitter);
};

module.exports = Collector;