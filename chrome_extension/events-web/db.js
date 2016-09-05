var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/event-leaks',
  function () {
    console.log ('mongodb connected')
  }
)

module.exports = mongoose
