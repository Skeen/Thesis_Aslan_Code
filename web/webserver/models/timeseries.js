var db = require ('../db');

var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  

var TimeSeries = db.model ('TimeSeries', {
  // time_series   : { type : [[Number]], required: true},
  // time_series   : { type : [{ item: [{item:[Number]}]}], required: true},
  // time_series   : { type : [{ result: [{startTime : Number, delta : Number}] } ], required: true},
  
  time_series   : { type : [{ wid         : Number, 
                              workerStart : Number, 
                              payload     : {startTimes: [Number], fibTimes: [Number] }}], 
                    required: true},
  derived        : { type     : { maxTS: {startTimes: [Number], fibTimes: [Number] }
                                , processStatus: {Type:String, default:"default"}},
                     required : false },    
  url            : { type : String  , required: false},
  date           : { type : Date    , required: true, default: Date.now },
  user_agent     : { type : String  , required: false},
  user_cookie    : { type : String  , required: false},
  client_ip      : { type : String  , required: false},
  window_width   : { type : Number  , required: false},
  window_height  : { type : Number  , required: false},
  screen_width   : { type : Number  , required: false},
  screen_height  : { type : Number  , required: false},
  fibfrac        : { type : Number  , required: false},
  n_webworkers   : { type : Number  , required: false},
  entry_kind     : { type : String  , required: false},
  tag            : { type : String  , required: false},
  start_timestamp: { type : Number  , required: false},
  job_id         : { type : Schema.Types.ObjectId, ref: 'GatherJobs', required: false },
  
})

module.exports = TimeSeries

