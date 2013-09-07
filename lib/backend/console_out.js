var util = require('util')
  , Out = require('./out')
;

function ConsoleOut() {
  'use strict';
  Out.apply(this, ['console_out']);
}

util.inherits(ConsoleOut, Out);

ConsoleOut.prototype.send = function(data) {
  'use strict';
  console.log(data.text);
};

module.exports = ConsoleOut;