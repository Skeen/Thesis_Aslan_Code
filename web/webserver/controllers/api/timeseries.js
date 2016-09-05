var TimeSeries = require ('../../models/timeseries');
var router     = require('express').Router()

var _          = require ('underscore');
var logger     = require('../../logger')

var passport   = require('../../auth');


var JFF = require('./JobFileFormatter');


// this is the only api call that is public... 2016-03-28

router.post('/api/timeseries', function (req, res, next) {

  logger.debug (req.body.job_id);

  var payload = req.body; // yay, json
  payload.client_ip = req.connection.remoteAddress; // record the IP info

  var ts = new TimeSeries(payload); //

  ts.save (function (err, post){
    if (err) {
      return next (err);
    }
    res.status(201).json (post);
  });
});



// the rest of the routes are restricted,
// and need to go via authentication...


// restricted routing

var basicAuth  = passport.authenticate('basic', { session: false} );
// restricted.use(basicAuth);

function restricted_get (x, y) {
  router.get(x, basicAuth, y)
}

restricted_get('/api/timestamps/', 
  function (req, res, next) {
  TimeSeries.distinct("start_timestamp").exec(function (err, ts) {
    if (err) {
      return next (err);
    }
    var r = _.filter(ts, function (n) {
                           return (typeof (n) == 'number');
                         });
    res.json(r);
  })
});


restricted_get('/api/tags/', function(req, res, next) {
    TimeSeries.distinct("tag").exec(function (err, tags) {
      if (err) {
        return next (err);
      }

      res.json(tags);
    } )
});




restricted_get('/api/derived_jobfile/:start_timestamp', function (req, res, next) {
    logger.debug ("generating job file for ", req.params.start_timestamp);
    
    var params = { start_timestamp: req.params.start_timestamp, 
                           derived: {$exists:true} };
    
    var projection = { "time_series" : 0 }
    
    
    res.setHeader ('content-type', 'application/octet-stream');
    
    var stream = TimeSeries
          .find(params, projection)
          .sort({"_id":1})
          .lean()
          .batchSize(1000)
          .stream(
            {transform : JFF.docToString}
           );
           
    stream.pipe(res);

});


restricted_get('/api/timeseries/count/', function (req, res, next) {
    TimeSeries.find().count().exec(function (err, count) {
      if (err) {
        return next (err);
      }
      res.json(count);
    })
  }
);


// 2016-03-08: TODO: proper handling of various CastErrors

restricted_get('/api/timeseries/tag/:tag', function (req, res, next) {
  
  var qLimit = 5;
  if (!isNaN(req.query.limit)) {
    qLimit = req.query.limit;
  }

  var params = { tag: req.params.tag };

  if (req.query.start_timestamp) {
    params.start_timestamp = req.query.start_timestamp;
  }


  TimeSeries.find( params )
  .sort({"date":-1}).limit(qLimit)
  .exec(function(err, ts) {
    if (err) {
      return next (err);
    }
    res.json (ts);
  });
});




restricted_get('/api/timeseries/id/:id', function (req, res, next) {
  TimeSeries.findById( req.params.id )
  .exec(function (err, ts) {
    if (err) {
      return next (err);
    }
    res.json([ts]);
  });
});


// setting up authentication


module.exports = router

