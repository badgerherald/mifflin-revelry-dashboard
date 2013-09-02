var mongojs = require('mongojs')
  , async = require('async')
  , util = require('util')
;

function MongoStore(db, collection) {
  'use strict';
  this.collection = mongojs(db, [collection]).collection;
}

MongoStore.prototype.set_counts = function(items, name_accessor) {
  'use strict';
  async.each(items, function(tracker, callback) {
    var name = name_accessor(tracker);
    this.collection.find({event: name}).count(function(error, count) {
      if (error) { console.warn(error); }
      tracker.count = count;
      callback();
    });
  });
};

MongoStore.prototype.save = function(data) {
  'use strict';
  this.collection.save(data, function(err, saved) {
    if (err || !saved) { console.warn('Data not saved!'); }
  });
};

module.exports = MongoStore;