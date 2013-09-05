var util = require('util')
  , Tee = require('./tee')
  , TwitterStreamer = require('./twitter_in')
  , MongoStore = require('./mongo_store')
  , MifflinOut = require('./console_out')
;

function MifflinTee(args) {
  'use strict';
  var input = new TwitterStreamer(args)
    , store = new MongoStore(args.db, args.collection)
    , output = MifflinOut;
  Tee.apply(this, ['mifflin_tweet', input, store, output]);
}

util.inherits(MifflinTee, Tee);

module.exports = MifflinTee;