var util = require('util')
  , Tee = require('./tee')
  , TwitterStreamer = require('./twitter_in')
  , MongoStore = require('./mongo_store')
  , MifflinOut = require('./console_out')
;

function MifflinTee(args) {
  'use strict';
  Tee.apply(this, ['mifflin_tweet']);
  this.input = new TwitterStreamer(args);
  this.store = new MongoStore(args.db, args.collection);
  this.output = MifflinOut;
}

util.inherits(MifflinTee, Tee);

module.exports = MifflinTee;