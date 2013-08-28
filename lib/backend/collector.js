var util = require('util')
  , events = require('events')
;

function Collector(streamer, emitter) {
  'use strict';
  this.streamer = streamer;
  this.emitter = emitter.emit;
}

util.inherits(Collector, events.EventEmitter);

Collector.prototype.stream = function() {
  'use strict';
  this.streamer.stream(this.emitter);
};

module.exports = Collector;