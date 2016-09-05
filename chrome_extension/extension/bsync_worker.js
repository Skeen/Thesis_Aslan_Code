

var initialize_data = null;
var last = false;
var fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352, 24157817, 39088169, 63245986, 102334155, 165580141, 267914296, 433494437, 701408733, 1134903170, 1836311903, 2971215073, 4807526976, 7778742049, 12586269025];
var fibonacci_sizes = [1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177, 287, 465, 753, 1219, 1973, 3193, 5167, 8361, 13529, 21891, 35421, 57313, 92735, 150049, 242785, 392835, 635621, 1028457, 1664079, 2692537, 4356617, 7049155, 11405773, 18454929, 29860703, 48315633, 78176337, 126491971, 204668309, 331160281, 535828591, 866988873, 1402817465, 2269806339, 3672623805, 5942430145, 9615053951, 15557484097, 25172538049, 40730022147];
var results = [];

function print(msg) {
    console.log("WORKER " + initialize_data.id + ": " + msg);
}

function smooth_fib_w(n, k) {
    if (n==0 || n==1) {
        return n;
    }

    var k1 = fibonacci_sizes[n-1];

    if (k > k1) {
        return smooth_fib_w(n-1, k1) + smooth_fib_w(n-2, k-k1-1);
    }
    else {
        return smooth_fib_w(n-1, k) + fibonacci_numbers[n-2];
    }
}

function smooth_fib(n, frac) {
    return smooth_fib_w(n, frac*fibonacci_sizes[n]);
}

function getFibTime() {
    var start = new Date().getTime();
    smooth_fib(initialize_data.fibval, initialize_data.fibfrac);
    var end = new Date().getTime();
    return [start, end-start];
}

function getTimeSeries() {
    for (var i = 0; i < initialize_data.interval_samples; i++) {
        results.push(getFibTime());
    }

    if (last) {
        self.postMessage({done: true,
                          payload: results});
        self.close();
        print("Worker terminating.");
    }
    else {
        self.postMessage({done: false,
                          payload: null});
        print("Finished an interval.");
    }

}


onmessage = function(e) {
    console.log("on message");
    if(!initialize_data) {
        if (e.data.fibval) {
          initialize_data = e.data;
          print("Getting timeseries. Fibval is " +
                 initialize_data.fibval + ", Fibfrac is " +
                 initialize_data.fibfrac);
          print("Taking " + initialize_data.interval_samples
                          + " samples.")
        } else {
          console.log("on message contains undefined data", e.fibval);
          return;
        }
    }

    if (e.data == "yield") {
        last = true;
    }

    // TODO: consider whether this is helpful
    getTimeSeries();
}
