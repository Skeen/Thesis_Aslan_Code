var GatherJobs = require('../models/gatherjobs');


function addSomeJobs () {
    var job = new GatherJobs(
            { site_array : ['blank'],
              job_name   : 'debugging',
              target_machine: ['aslan_mbp15'],
              is_all_machines : false,
              sync_barriers: 30, 
              webworker_count: 4,
              num_trials: 10,
              page_load_timeout: 120,
              sampling_time : 180,
              fibfrac : 0.2
        } );
        
    job.save(function (err, post) {
        if (err) {
            console.log(err);
        } else {
            // 
            // do something with the res
            // 
            console.log ("save ok");
        }
    })
}

function main () {
    addSomeJobs();
    console.log("main done");
}


main();
