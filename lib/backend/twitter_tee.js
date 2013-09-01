var util = require('util')
  , Tee = require('./tee')
  , TwitterStreamer = require('./twitter_in')
  , ConsoleEmitter = require('./console_out')
;

function TwitterTee(args) {
  'use strict';
  var input = new TwitterStreamer(args)
//    , store = mongothing
    , output = ConsoleEmitter
  ;
  Tee.call(this, streamer, emitter);
}

util.inherits(TwitterTee, Tee);

module.exports = TwitterTee;