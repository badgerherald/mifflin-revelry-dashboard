var util = require('util')
,   Collector = require('./collector')
,   TwitterStreamer = require('./twitter_stream')
,   ConsoleEmitter = require('./console_emit');

function TwitterCollector(args) {
    var streamer = new TwitterStreamer(args);
    var emitter = ConsoleEmitter;
    Collector.call(this, streamer, emitter);
}

util.inherits(TwitterCollector, Collector);

module.exports = TwitterCollector;