var express    = require ('express');
var bodyParser = require ('body-parser');
var fs         = require ('fs');
var https      = require ('https');
var util       = require ('util');
var memwatch   = require('memwatch')
var morgan     = require('morgan')
var logger     = require('./logger')


// authentication; 2016-03-28; AA

var passport =   require('./auth');



var port       = 3000;
var HOME=process.env.HOME;


var SSLPATH = '/etc/letsencrypt/live/jsspy.askarov.net/';

var httpOptions = {
  key : fs.readFileSync (SSLPATH + 'privkey.pem'),
  cert: fs.readFileSync (SSLPATH + 'cert.pem'),
  ca  : fs.readFileSync (SSLPATH + 'chain.pem')
};





var httpLog = morgan ('combined', { "stream": {write: function(str) { logger.debug(str.trim()) }}});

var app = express ();
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(httpLog);


var basicAuth = passport.authenticate('basic', { session: false} )



// serve static pages from ../webdemo

app.use('/common',  express.static(HOME + '/webcommon'      ));
app.use('/client',  express.static(HOME + '/webclient_spy'  ));


// queries are restricted

app.use('/query' ,  basicAuth, express.static(HOME + '/webclient_query'));




app.use(require('./controllers/api/gatherjobs')); 

app.use(require('./controllers/api/timeseries'));



app.get ('/api/ping', function (req, res) {
  logger.debug ("ping");
  res.status(201).json("pong");
});



var server = https.createServer (httpOptions, app);

var hd;
memwatch.on('leak', function(info) {
  logger.error ('Memory leak detected: >>> ', info);
  if (!hd) {
    hd = new memwatch.HeapDiff();
  } else {
     var diff = hd.end();
    logger.error(util.inspect(diff, true, null));
    hd = null;
  }
});

server.listen(port, function() {
  logger.info('Server listening on', port);
});


