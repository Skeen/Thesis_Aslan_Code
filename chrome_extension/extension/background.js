// 2015-11-26; AA – creating a background script
// to be used to control the webworkers



var BASEURL = "http://jsspy.askarov.net/webdemo/"


console.log("background extension is running")


// 2015-11-25; this is embarrassingly straightforward; AA

var document_href = document.location.href;



// 2015-11-25; AA -- copying this
// functionality verbatim from bsync_main.js
// TODO: refactor this so that we have
// preferably one centralized place for
// all the time series gathering functionality

// var g_worker_as_string = 'function print(i){console.log("WORKER "+my_id+": "+i)}function smooth_fib_w(i,e){if(0==i||1==i)return i;var t=fibonacci_sizes[i-1];return e>t?smooth_fib_w(i-1,t)+smooth_fib_w(i-2,e-t-1):smooth_fib_w(i-1,e)+fibonacci_numbers[i-2]}function smooth_fib(i,e){return smooth_fib_w(i,e*fibonacci_sizes[i])}function getFibTime(i,e){var t=(new Date).getTime();smooth_fib(i,e);var r=(new Date).getTime();return[t,r-t]}function getTimeSeries(){print("Getting timeseries. Fibval is "+fibval+", Fibfrac is "+fibfrac),print("Taking "+samples+" samples.");for(var i=[],e=0;samples>e;e++)i.push(getFibTime(fibval,fibfrac));self.postMessage(JSON.stringify(i)),self.close(),print("Worker finished.")}function getTimeSeriesAvg(i,e,t){for(var r=0,a=0;i>a;a++)r+=getFibTime(e,t)[1];return r/i}function getOptimalParams(i,e,t){var r=35;print("Computing optimal fractional parameter on fib("+r+")");for(var a=0,n=1,s=0,o=0;15>s;){if(++s,o=getTimeSeriesAvg(t,r,(a+n)/2),print("Step: "+s),print("INCUMBENT: "+o),Math.abs(o-i)<e)return print("SUCCESS. exiting with incumbent "+o+" after "+s+" steps."),self.postMessage([r,(n+a)/2]),(n+a)/2;o>i?(n=(n+a)/2,print("fibfrac_hi is now "+n)):i>o&&(a=(n+a)/2,print("fibfrac_low is now "+a))}print("ERROR: desired precision not found. RETRYING."),getOptimalParams(i,e,t)}var fibval,my_role,samples,fibfrac,my_target,fibonacci_numbers=[0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946,17711,28657,46368,75025,121393,196418,317811,514229,832040,1346269,2178309,3524578,5702887,9227465,14930352,24157817,39088169,63245986,102334155,165580141,267914296,433494437,701408733,1134903170,1836311903,2971215073,4807526976,7778742049,12586269025],fibonacci_sizes=[1,1,3,5,9,15,25,41,67,109,177,287,465,753,1219,1973,3193,5167,8361,13529,21891,35421,57313,92735,150049,242785,392835,635621,1028457,1664079,2692537,4356617,7049155,11405773,18454929,29860703,48315633,78176337,126491971,204668309,331160281,535828591,866988873,1402817465,2269806339,3672623805,5942430145,9615053951,15557484097,25172538049,40730022147],my_id=-1;onmessage=function(i){fibval=i.data[0],samples=i.data[1],fibfrac=i.data[2],my_role=i.data[3],my_id=i.data[4],"param_getter"==my_role?(my_target=i.data[5],setTimeout(function(){getOptimalParams(my_target,2,100),self.close()},100)):"core_counter"==my_role?print("corecounter not yet implemented"):"ts_getter"==my_role&&setTimeout(getTimeSeries,100)};';

var g_worker_as_string = "console.log ('logging from the webworker');"; // Not used for now

var blobURL = URL.createObjectURL(new Blob)


// 2015-11-25; AA; note that I have hardcoded a
// bunch of constants in here; ideally, these should
// be properly initialized, though tag should be obtained
// from the href

var globals = {
    worker_blob : new Blob([g_worker_as_string],
                           {type: "application/javascript"}),
    fibval : 35,
    fibfrac : 0.2,
    threadcount : 8,
    samples : 512,
    tag : "",
    user_cookie : "extension-aslan-mbp15",
    submit_count : 0,
    target_return_time : 35,
    timestamp : -1,
    entry_kind : "traindata",
    barrier_count : 30
}


var workersRunning = false;


function parseURL(url){
    parsed_url = {}

    if ( url == null || url.length == 0 )
        return parsed_url;

    protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0,protocol_i);

    remaining_url = url.substr(protocol_i + 3, url.length);
    domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    domain_parts = parsed_url.domain.split('.');
    switch ( domain_parts.length ){
        case 2:
          parsed_url.subdomain = null;
          parsed_url.host = domain_parts[0];
          parsed_url.tld = domain_parts[1];
          break;
        case 3:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2];
          break;
        case 4:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
          break;
    }

    parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

    return parsed_url;
}


function gather_timeseries(url) {
    var ww_semaphore = globals.threadcount;
    var barriers_remaining = globals.barrier_count;

    globals.tag = parseURL(url).host; // 2015-11-26;

    console.log(globals.tag);

    workersRunning = true;

    result_list = [];
    worker_list = [];
    console.log('Now gathering timeseries with '
        + globals.threadcount + ' webworkers.');

    function barrier_handler(e) {
        // if we have a result, push it
        if (e.data.done) {
            result_list.push(e.data.payload);
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
                send_jsonned_series(JSON.stringify(result_list))
                workersRunning = false;
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

        // console.log (worker_init_packet);

        console.log(globals.worker_blob);
        // var w = new Worker(globals.worker_blob);

        var w = new Worker("bsync_worker.js");
        console.log (w);

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
        // TODO: fix these ; 2015-11-26
        client_ip     : "",  // $.trim(document.getElementById('client_ip').innerHTML),
        window_width  : 0,   // $(document).width(),
        window_height : 0,   // $(document).height(),
        screen_width  : 0,   // screen.height,
        screen_height : 0,   // screen.width,
        fibfrac : globals.fibfrac,
        entry_kind : globals.entry_kind,
        n_webworkers : globals.threadcount,
        start_timestamp : globals.timestamp
    };

    jQuery.ajax({
        type: "POST",
        url: BASEURL + "check_in_series.php",
        dataType: "text",
        data: tagged_data,
        success: function(data) {
            console.log("Successfully sent training string for " + globals.tag);
            }
        }
    );

    return;
}






chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    if (! workersRunning ) {
        gather_timeseries(sender.tab.url);
    } else {
      console.log ("workers are running, so we don't launch anything")
    }

    /*
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
     */

  });
