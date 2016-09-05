var mongoose        = require('mongoose')
var logger   = require('./logger')

const EventEmitter  = require('events').EventEmitter
const util          = require('util')

function JsSpyDbStatus () {
  EventEmitter.call(this);
}

util.inherits(JsSpyDbStatus, EventEmitter);

const jsspyDbStatus = new JsSpyDbStatus();

mongoose.jsspyDbStatus = jsspyDbStatus;

mongoose.connect('mongodb://localhost/event-leaks',
  function () {
    logger.info ('mongodb connected')
    jsspyDbStatus.emit("ready");
    
  }
)

module.exports = mongoose
