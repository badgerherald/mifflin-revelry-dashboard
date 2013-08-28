var util = require('util')
  , Collector = require('./collector')
  , TwitterStreamer = require('./twitter_stream')
  , ConsoleEmitter = require('./console_emit')
;

function TwitterCollector(args) {
  'use strict';
  var streamer = new TwitterStreamer(args)
    , emitter = ConsoleEmitter
  ;
  Collector.call(this, streamer, emitter);
}

util.inherits(TwitterCollector, Collector);

module.exports = TwitterCollector;