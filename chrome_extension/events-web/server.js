var express    = require ('express');
var bodyParser = require ('body-parser');
var Timestamp  = require ('./models/timestamp');


var app = express ();
app.use (bodyParser.json());

app.get ('/api/timestamps', function (req, res) {
    res.json([1,2,3])
})


app.get ('/api/ping', function (req, res) {
  console.log("ping");
})

app.post('/api/timestamps', function (req, res, next) {
  console.log (req.body.url);
  var ts = new Timestamp({
    deltas     : req.body.deltas,
    url        : req.body.url
  })

  ts.save (function (err, post){
    if (err) {
      return next (err)
    }
    res.status(201).json (post);
  })
})


app.listen(3000, function() {
  console.log('Server listening on', 3000)
});
