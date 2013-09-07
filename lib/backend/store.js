var async = require('async')
  , events = require('events')
  , util = require('util')
;

function Store() {
  'use strict';
}

util.inherits(Store, events.EventEmitter);

Store.prototype.save = function(data) {
  'use strict';
  this._save(data, function afterSave(err) {
    if (err) { console.warn('Error saving entry!'); }
  });
};

Store.prototype.count = function(names) {
  'use strict';
  var counts = {}
    , _this = this
  ;
  names.forEach(function initNameCount(name) { counts[name] = 0; });
  async.each(names
  , function getNameCount(name, callback) {
      _this._count(name, function afterOneCount(err, count) {
        if (err) { console.warn(err); }
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

Store.prototype.get = function(names, count) {
  'use strict';
  var entries = []
    , _this = this
  ;
  async.each(names
  , function (name, count, callback) {
      _this._get(name, function afterGet(err, data) {
        if (err) { console.warn('Error getting entries from ' + name); }
        entries.push(
          { 'event': name
          , 'entries': data
          }
        );
        callback();
      });
    }
  );
};

module.exports = Store;