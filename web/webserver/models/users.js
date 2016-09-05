var db = require('../db');

var Users = db.model('Users',  {
    username     :  { type : String, required: true, index: { unique: true } },
    salt         :  { type : String, required: true },
    passwordhash :  { type : String, required: true },
    created      :  { type : Date, required: true, default: Date.now },
    active       :  { type : Boolean, required :true, default: true } 
})


module.exports = Users