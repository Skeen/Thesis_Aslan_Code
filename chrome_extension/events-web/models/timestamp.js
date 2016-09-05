var db = require ('../db');

var Timestamp = db.model ('Timestamp', {
  deltas    : { type : [Number], required: true},
  url       : { type : String  , required: true},
  date      : { type : Date    , required: true,    default: Date.now }
})

module.exports = Timestamp
