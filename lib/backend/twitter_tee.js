var util = require('util')
  , Tee = require('./tee')
  , TwitterStreamer = require('./twitter_in')
  , MongoStore = require('./mongo_store')
  , ConsoleOut = require('./console_out')
;

function TwitterTee(args) {
  'use strict';
  var store = new MongoStore(args.db, args.collection)
    , output = ConsoleEmitter;

  var input = new TwitterStreamer(args);
}

util.inherits(TwitterTee, Tee);

module.exports = TwitterTee;