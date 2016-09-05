#!/usr/bin/env nodejs

var amqp = require('amqplib/callback_api');

amqp.jsSpyConnect = function (cb) {
    this.connect ('amqp://localhost', cb);
}


amqp.jsSpyConnect(function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1); 
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      console.log("     Gonna pretent we are doing some important work");
      setTimeout (function () {
        console.log("     Done doing important work"); 
        ch.ack(msg); 
      }, 2000)
    }, {noAck: false});
  });
});
