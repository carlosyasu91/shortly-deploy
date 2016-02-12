var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var crypto = require('crypto');
var util = require('../lib/utility');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', function() {
  console.log("we're connected to db");
});

var urlSchema = new mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: {
    type: Number,
    default: 0
  }
});

module.exports.urlSchema = urlSchema;

urlSchema.pre('save', function(next){
  var self = this;
  util.getUrlTitle(this.url, function(err, title){
    self.title = title;
    var shasum = crypto.createHash('sha1');
    shasum.update(self.url);
    self.code = shasum.digest('hex').slice(0, 5);
    next();
  });
});

var Link  = mongoose.model('Link', urlSchema);

// var Url = mongoose.model('Url', urlSchema);
module.exports.Link = Link;
// module.exports = db;




var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
});

userSchema.pre('save', function(next){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
  .then(function(hash){
    this.password = hash;
    next();
  });

});

module.exports.User = mongoose.model('User', userSchema);

module.exports.userSchema = userSchema;