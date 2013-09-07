var util = require('util')
  , events = require('events')
;

function Tee(name) {
  'use strict';
  this.name = name;
}

util.inherits(Tee, events.EventEmitter);

Tee.prototype.tee = function(data) {
  'use strict';
  if (!this.store && !this.output) {
    console.warn('Can\'t tee -- no store our output attached!');
    return;
  }
  if (this.store) { this.store.save(data); }
  if (this.output) { this.output.emit(data); }
};

Tee.prototype.stream = function() {
  'use strict';
  if (!this.input) {
    console.warn('Can\'t stream -- no input attached!');
    return;
  }
  var _this = this;
  this.input.on(this.name, function(d) {
    _this.tee(d);
  });
  this.input.stream(this.name);
};

module.exports = Tee;