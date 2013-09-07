var util = require('util')
  , Tee = require('stream-tee').Tee
  , TwitterStreamer = require('./twitter_in')
  , MongoStore = require('./mongo_store')
  , ConsoleOut = require('./console_out')
;

function MifflinTee(args) {
  'use strict';
  Tee.apply(this, ['mifflin_tweet']);
  this.input = new TwitterStreamer(this.name, args);
  this.store = new MongoStore(args.db, args.collection);
  this.output = new ConsoleOut();
}

util.inherits(MifflinTee, Tee);

module.exports = MifflinTee;