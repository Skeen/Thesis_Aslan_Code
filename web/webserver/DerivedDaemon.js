var TimeSeries = require('./models/timeseries');
var DerivedMax = require('./DerivedMax');
var logger = require('./logger')


var timeouts = [1000, 2000, 5000, 10000, 30000, 60000];


function computeOneDerivedMax( k ) {
    var params = {
            "derived.maxTS": { $exists: false },
            start_timestamp: { $exists: true },
        }
        
    TimeSeries.findOne(params,
        function(err, ts) {
            
            if (ts == null) {
                // logger.debug ("no underived found");
                k (2);
            }
            else {
                // we have a match!
                // console.log(ts._id);
                DerivedMax.computeMax(ts, function(res) {
                    // logger.debug ("derived max is done:")
                    ts.derived = {maxTS: {startTimes: res.startTime,
                                         fibTimes  : res.fibTime    }
                    };
                    
                    // TODO: 2016-03-22: OBS that validation is turned off!
    
                    ts.save ({ validateBeforeSave: false }, function (err) {
                        if (err) {
                            logger.error(err);
                            //return handleError (err);
                        } else {
                            logger.debug("saved derived max for" , ts._id);
                            // call continuation
                            k(1);
                        }
                    })
                })
            }
        })
}


// lastStatus: 0  - first call
// lastStatus: 1  - called after save
// lastStatus: 2 - called after nothing has been found


var currentTimeout = 0;
function poll(lastStatus) {
    switch (lastStatus) {
        case 0:
            currentTimeout = 0;
            setImmediate(computeOneDerivedMax, poll);
            break;
        case 1:
            currentTimeout = 0;
            setImmediate(computeOneDerivedMax, poll);
            break;
        case 2:
            // bump timeouts
            
            if (currentTimeout < timeouts.length - 1) {
                currentTimeout ++;
            }
            
            setTimeout(function () {
                    computeOneDerivedMax (poll);    
                }, timeouts[currentTimeout]);
                
            break;
    }
}

function startDaemon() {
    logger.debug("derived daemon called");
    poll(0);
}


module.exports = {
    startDaemon: startDaemon
}
