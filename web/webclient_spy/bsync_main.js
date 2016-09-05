var g_worker_as_string = ""; // Not used for now

var globals = {
    worker_blob : new Blob([g_worker_as_string],
                           {type: "application/javascript"}),
    fibval : 35,
    fibfrac : -1,
    threadcount : 4,
    samples : 1024,
    tag : "no_tag",
    user_cookie : "no_user",
    submit_count : 0,
    target_return_time : 35,
    timestamp : -1,
    entry_kind : "no_entry_kind",
    barrier_count : -1,
    job_id : ""
}

function gather_timeseries() {
    var ww_semaphore = globals.threadcount;
    var barriers_remaining = globals.barrier_count;

    result_list = [];
    worker_list = [];
    console.log('Now gathering timeseries with '
        + globals.threadcount + ' webworkers.');

    function barrier_handler(e) {
        // if we have a result, push it
        if (e.data.done) {
            result_list.push( { wid: e.data.id, workerStart: e.data.workerStartTime, payload: e.data.payload} );
        }

        --ww_semaphore;
        if (ww_semaphore == 0) {
            --barriers_remaining;
            console.log("Barrier hit, " + barriers_remaining + " left.");
            if (barriers_remaining > 0) {

                if (barriers_remaining == 1) {
                    var msg = "yield";
                }
                else {
                    var msg = "continue";
                }

                for (var j = 0; j < globals.threadcount; ++j) {
                    worker_list[j].postMessage(msg);
                }

                ww_semaphore = globals.threadcount;
            }
            else {
                console.log("Timeseries collection finished.");
                // send_jsonned_series(JSON.stringify(result_list))
                send_jsonned_series(result_list)
            }
        }
    }

    // Initialize the webworkers
    for (var i = 0; i < globals.threadcount; ++i) {
        var worker_init_packet = {
            fibval : globals.fibval,
            fibfrac : globals.fibfrac,
            id : i,
            interval_samples :
                Math.floor(globals.samples / globals.barrier_count)
        }

        var w = new Worker("bsync_worker.js");

        w.addEventListener('message', barrier_handler);
        w.postMessage(worker_init_packet);
        worker_list.push(w);
    }
}

function send_jsonned_series(jsonResult) {
    var tagged_data = {
        user_agent : navigator.userAgent,
        time_series : jsonResult,
        tag : globals.tag,
        user_cookie : globals.user_cookie,
        // client_ip : $.trim(document.getElementById('client_ip').innerHTML), // we read it off the request on the server side
        window_width : $(document).width(),
        window_height : $(document).height(),
        screen_width : screen.height,
        screen_height : screen.width,
        fibfrac : globals.fibfrac,
        entry_kind : globals.entry_kind,
        n_webworkers : globals.threadcount,
        start_timestamp : globals.timestamp,
        job_id : globals.job_id
    };
    
    console.log (tagged_data);

    jQuery.ajax({
        type: "POST",
        url: "/api/timeseries/",
        contentType: "application/json",
        data: JSON.stringify(tagged_data),
        success: function(data) {
            document.getElementById("rec_state").innerHTML =
                "Successfully sent training string for " + globals.tag;
            }
        }
    );

    return;
}


function init_and_run () {
     // split URL to extract arguments
    var args = document.URL.split('?');
    var ARGS_EXPECTED = 9;

    if (typeof(Worker) !== "undefined" && args.length == ARGS_EXPECTED) {
       

    	globals.fibfrac       = parseFloat(args[1]);
        globals.user_cookie   = args[2];
        globals.tag           = args[3];
        globals.timestamp     = parseInt(args[4]);
        globals.threadcount   = parseInt(args[5]);
        globals.barrier_count = parseInt(args[6]);


        var kind_lc = args[7].toLowerCase();
        if (kind_lc == "testdata"
         || kind_lc == "calibrationdata"
         || kind_lc == "traindata") {
            globals.entry_kind = kind_lc;
        }
        else {
            alert("Invalid entry kind");
            return;
        }

        // document.getElementById("rec_state").innerHTML = "TARGET ACQUIRED: " + globals.tag;
        // $(document.getElementById("predictions")).hide();
        // $(document.getElementById("target_sites")).hide();
        // $(document.getElementById("fibfrac_recompute_button")).hide();
        
        
        globals.job_id     = args[8];

        gather_timeseries();
    }
    else if (args.length < ARGS_EXPECTED && args.length > 1) {
        alert("wrong number of URL arguments. USAGE: \
               http://js-spy.net/?fibfrac?username?site?timestamp?threads?numbarriers?type");
    }
    else {
        console.log("Workers unsupported.");
    }
}

window.onload = init_and_run;