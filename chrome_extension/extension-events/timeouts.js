var timeouts = []
var deltas  = []

var prev = null;

var start = null;

function counter() {
    var cur = new Date().getTime()
    timeouts.push(cur);

    if (prev) {
        deltas.push (cur - prev);
    } else {
        start = cur;
    }

    prev = cur;

    if (timeouts.length < 512)  {
    // if ( cur - start < 2000) {
        setTimeout(counter,0);
    } else {
        // 2015-11-29; AA
        // we stopped gathering data, so time to send it home
        // because we cannot do it immediately, we have to
        // dance around the SOP issues by sending a message
        // to a background process that will do the forwarding
        // job for us
        //
//        chrome.runtime.sendMessage(
           // this is our main object to send home.
//           { deltas: deltas, url:document.location.href }, 
//           function (res) {
//              console.log(response.farewell); 
//           });
           console.log(deltas)
    }
}

counter ();
