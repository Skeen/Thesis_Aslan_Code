var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/event-leaks';


function main() {
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        }
        else {
            //HURRAY!! We are connected. :)
            console.log('Connection established to', url);

            // Get the documents collection
            var collection = db.collection('timeseries');

            var cursor_ts = collection.find({start_timestamp:1458112466});
            cursor_ts.each ( function (err, doc) {
                if (err) {
                    console.log (err);
                }
                else {
                    if (doc == null) {
                        db.close();
                    } else {
                      console.log(doc._id);   
                    }
                }
            } );
            
        }
    });

}

main();
