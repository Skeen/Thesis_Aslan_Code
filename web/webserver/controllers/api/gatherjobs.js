var mongoose = require('mongoose');

var router = require('express').Router()
var GatherJobs = require('../../models/gatherjobs'),
  TimeSeries = require('../../models/timeseries')

var logger = require('../../logger');

// these are currently public
// consider restricting access to these
// 



// 2016-07-09 – simply returns all tasks

router.get('/api/gatherjobs/all', function(req, res, next) {
  GatherJobs.find({
      active: true
    })
    .exec(function(err, js) {
      if (err) {
        return next(err);
      }
      res.json(js);
    });
});


// 2016-07-09 - common tasks are the one that are not assigned to 
// a particular machine


router.get('/api/gatherjobs/common', function(req, res, next) {
  GatherJobs.find({
      active: true,
      is_all_machines: true
    })
    .exec(function(err, js) {
      if (err) {
        return next(err);
      }
      res.json(js);
    });
});


router.get('/api/gatherjobs/target/:machine', function(req, res, next) {
  // logger.debug (req.params.machine);
  GatherJobs.find({
      active: true,
      $or: [{
        target_machine: req.params.machine
      }, {
        is_all_machines: true
      }]
    })
    .exec(function(err, js) {
      if (err) {
        return next(err);
      }
      res.json(js);
    })
})

router.post('/api/gatherjobs/done/:id', function(req, res, next) {
  GatherJobs.findById(req.params.id).exec(function(err, js) {
    if (err) {
      logger.debug(err);
      return next(err);
    }
    js.job_completion_date = Date.now();
    js.active = false;
    js.save(function(err, doc) {
      if (err) {
        logger.debug(err);
        return next(err);
      }
    });

    // find relevant time series entries for this job and mark them as complete
    

    var query   = { job_id: new mongoose.mongo.ObjectId(req.params.id)};
    var update  = { $set: { "derived.processStatus" : "complete" }}
    var options = { multi: true }
    
    TimeSeries.update(query,update, options, function (err, nAffected) {
        if (err) {
          logger.debug (err)
        } else {
          logger.debug("updated ", nAffected, "timeseries entries");
        }
      }
    );


    
    res.status(201).json(js);
    
  });
});



module.exports = router