var util = require('util')
  , events = require('events')
;

function Tee(name, input, store, output) {
  'use strict';
  this.name = name;
  this.input = input;
  this.store = store;
  this.output = output;
}

util.inherits(Tee, events.EventEmitter);

Tee.prototype.tee = function(data) {
  'use strict';
  if (this.store) { this.store.save(data); }
  if (this.output) { this.output.emit(data); }
};

Tee.prototype.stream = function() {
  'use strict';
  this.input.stream(this.tee);
};

module.exports = Tee;