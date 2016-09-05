var TimeSeries = require('../models/timeseries');
var DerivedMax = require('./DerivedMax');
var logger = require('../logger')
var amqp   = require('../amqp') 




function computeOneDerivedMax( k ) {
    var params = {
            "derived.maxTS": { $exists: false },
            start_timestamp: { $exists: true },
        }
        
    TimeSeries.findOne(params,
        function(err, ts) {
            
            if (ts == null) {
                logger.debug ("no time series with uncomputed derived-max found");
                k ();
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
                            //  
                            // we have more todo, so we set ourselves to run again
                            setImmediate(computeOneDerivedMax, k) 
                        }
                    })
                })
            }
        })
}



function setupQueue () {
    amqp.jsSpyConnect(function(err, conn) {
        conn.createChannel(function(err, ch) {
            var q = 'derived-max';
            ch.assertQueue(q, {durable: false});
            ch.prefetch(1);
            logger.debug ("Waiting for messages in %s", q);


            ch.consume(q, function (msg) {
                logger.debug ("Got a message in the derived-max queue"); 
                computeOneDerivedMax( function () { ch.ack (msg) } );
            })
        }, {noAck:false} )
    })
}

function startDaemon() {
    logger.debug("derived daemon called");
    computeOneDerivedMax(setupQueue)
}


// module.exports = {
//     startDaemon: startDaemon
// }


startDaemon(); 
