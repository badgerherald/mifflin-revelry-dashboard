var mongojs = require('mongojs')
  , async = require('async')
  , events = require('events')
  , util = require('util')
;

function MongoStore(db, collection) {
  'use strict';
  this.collection = mongojs(db, [collection]).collection;
}

util.inherits(MongoStore, events.EventEmitter);

MongoStore.prototype.get_counts = function(names) {
  'use strict';
  var counts = {}
    , _this = this
  ;
  names.forEach(function initNameCount(name) { counts[name] = 0; });
  async.each(names
  , function getNameCount(name, callback) {
      _this.collection.find({event: name}).count(function(error, count) {
        if (error) { console.warn(error); }
        counts[name] = count;
        callback();
      });
    }
  , function afterCounting(err) {
      if (err) { console.warn('Error setting counts'); }
      var event_name = names.join('_') + '_counted';
      _this.emit(event_name, counts);
    }
  );
};

MongoStore.prototype.load = function(names, count) {
  'use strict';
  var entries = []
    , _this = this
  ;
  async.each(names
  , function getEntries(name, callback) {
      _this.collection.find({event: name}).sort({id: -1}).limit(count
      , function addEntriesToArray(err, entries_part) {
          if (err) { console.warn('Error fetching entries!'); }
          entries.push(
            { 'event': name
            , 'entries': entries_part
            }
          );
        }
      );
    }
  , function sendEntries(err) {
      if (err) { console.warn('Error fetching entries'); }
      var event_name = names.join('_') + '_fetched';
      _this.emit(event_name, entries);
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