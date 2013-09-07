var async = require('async')
;

function Out(name) {
  'use strict';
  this.name = name;
}

Out.prototype.count = function(store, names) {
  'use strict';
  var _this = this
    , event_name = names.join('_') + '_counted'
  ;
  store.once(event_name, function onCounted(data) {
    _this.emit(name + '_count', data);
  });
};

Out.prototype.get = function(store, names, count) {
  'use strict';
  var _this = this
    , event_name = names.join('_') + '_fetched'
  ;
  store.once(event_name, function fetching(docs) {
    async.eachSeries(_this._sort(docs), function forEachDoc(doc, callback) {
      _this.send(doc, event_name);
      callback();
    });
  });
};

Out.prototype.send = function(data, event_name) {
  'use strict';
  throw new Error('You have to implement the send method yourself!');
};

Out.prototype._sort = function(a, b) {
  'use strict';
  return b < a;
};

module.exports = Out;