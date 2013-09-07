var mongojs = require('mongojs')
  , async = require('async')
  , events = require('events')
  , util = require('util')
  , Store = require('stream-tee').Store
;

function MongoStore(db, collection) {
  'use strict';
  this.collection = mongojs(db, [collection])[collection];
}

util.inherits(MongoStore, Store);

MongoStore.prototype._save = function(data, callback) {
  'use strict';
  this.collection.save(data, callback);
};

MongoStore.prototype._count = function(name, callback) {
  'use strict';
  this.collection.find({event: name}).count(callback);
  callback();
};

MongoStore.prototype._get = function(name, count, callback) {
  'use strict';
  this.collection.find({event: name}).sort({id: -1}).limit(count, callback);
};

module.exports = MongoStore;