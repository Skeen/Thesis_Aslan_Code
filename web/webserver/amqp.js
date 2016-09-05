var amqp = require('amqplib/callback_api');


amqp.jsSpyConnect = function (cb) {
    this.connect ('amqp://localhost', cb);
}

module.exports = amqp 
