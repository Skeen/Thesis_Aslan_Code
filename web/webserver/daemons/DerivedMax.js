function doWork(doc, callback, res, j) {
    var fibTime   = res.fibTime;
    var startTime = res.startTime
    
    
    // console.log (doc.time_series);
    
    var fibTime_j = doc.time_series[0].payload.fibTimes[j];
    var startTime_j = doc.time_series[0].payload.startTimes[j];

    // computing the maximum among the webworkers
    for (var w = 1; w < doc.n_webworkers; w++) {
        if (fibTime_j < doc.time_series[w].payload.fibTimes[j]) {
            fibTime_j = doc.time_series[w].payload.fibTimes[j];
            startTime_j = doc.time_series[w].payload.startTimes[j];
        }
    }
    
    
    fibTime[j] = fibTime_j;
    startTime[j] = startTime_j;


    if (j == doc.time_series[0].payload.startTimes.length - 1) {
        // we are done processing the whole array,
        // so we notify the callback
        setImmediate(callback, res);
    }
    else {
        setImmediate(doWork, doc, callback, res, j + 1);
    }

}

function computeMax(doc, callback) {
    var res = { fibTime: [], startTime: [] }
    doWork(doc, callback, res, 0);
}

module.exports = {
    computeMax: computeMax
}