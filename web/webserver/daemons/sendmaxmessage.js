#!/usr/bin/env nodejs 

var amqp = require ('../amqp'); 

amqp.jsSpyConnect(function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'derived-max';

    ch.assertQueue(q, {durable: false});
    ch.sendToQueue(q, new Buffer(''));
    console.log(" [x] Sent a message to derived-max queue");
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
