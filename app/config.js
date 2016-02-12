var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test2');
var crypto = require('crypto');
var util = require('../lib/utility');

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


//We think we added to the database
//


