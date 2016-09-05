var db = require ('../db');

var GatherJobs  = db.model ('GatherJobs', {
    active            : { type: Boolean , required: true, default: true },
    site_array        : { type: [String], required: true  },
    job_name          : { type : String, required: false},
    target_machine    : { type: [String], requried: false },
    is_all_machines   : { type: Boolean, required: true, default: false }, 
    sync_barriers     : { type: Number  , required: true  } ,
    fibfrac           : { type: Number  , requried: true  },
    num_trials        : { type: Number  , required: true  },
    page_load_timeout : { type: Number  , required: true  },
    sampling_time     : { type: Number  , required: true  },
    
    webworker_count : Number,
    num_trials      : Number,
    
    job_creation_date        : { type: Date, required: true, default : Date.now },
    job_completion_date      : { type: Date, required: false },
})

module.exports = GatherJobs