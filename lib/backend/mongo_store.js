var mongojs = require('mongojs')
  , async = require('async')
;

function MongoStore(db, collection) {
  'use strict';
  this.collection = mongojs(db, [collection]).collection;
}

MongoStore.prototype.set_counts = function(items, name_accessor) {
  'use strict';
  async.each(items
  , function getTrackerCount(tracker, callback) {
      var name = name_accessor(tracker);
      this.collection.find({event: name}).count(function(error, count) {
        if (error) { console.warn(error); }
        tracker.count = count;
        callback();
      });
    }
  , function setCountError(err) {
      if (err) { console.warn('Error setting counts'); }
    }
  );
};

MongoStore.prototype.save = function(data) {
  'use strict';
  this.collection.save(data, function afterSave(err, saved) {
    if (err || !saved) { console.warn('Data not saved!'); }
  });
};

module.exports = MongoStore;