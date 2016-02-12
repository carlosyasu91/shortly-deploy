var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/config').Link;
var User = require('../app/config').User;
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
  // var query = req.query;
  // User.find({}, function(err, users){
  //   if(err) throw err;
  //   res.json(users);
  // });
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  console.log('req.headers.origin: ' + req.headers.origin);
  // var link = req.body;
  if(!util.isValidUrl(uri)){
    console.log('Not a valid url: ', uri);
    return res.send(404);
  } else {
    Link.find({url: uri}, function(err, url){
      if(err) {
        console.log('Error finding URL heading: ', err);
      } else if(url){
        res.send(200, url);
      } else {
        Link.create({
          url: uri,
          baseUrl: req.headers.origin
        }, function(err, createdLink){
          if(err){
            return res.json(err);
          }
          res.send(200, createdLink);
        });
      }
    });
    
  }
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, user){
    if (err) {
      console.log("error finding user", err);
    }else if (!user) {
      res.redirect('/login');
    }else{
      util.comparePassword(password, user.password, function(match){
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });

};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;


  var user = req.body;
  User.find({username: username}, function(err, user){
    if (err) {
      console.log("error finding user", err);
    }else if (!user || user.length === 0){
      User.create({username: username, password: password}, function(err, createdUser){
        console.log('creating link inside');
        if(err){
          return res.json(err);
        }
        console.log('Error: ' + err);
        console.log('Created user: ' + createdUser);
        util.createSession(req, res, createdUser);
      });
      
    }else{
      console.log('user already exists');
      console.log(user);
      res.redirect('/signup');
    }
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
};

exports.navToLink = function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};

exports.retrieveLinks = function(req, res){
  console.log('This is the query: ');
  console.log(req.query);
  var query = req.query;
  Link.find({}, function(err, links){
    if(err) throw err;
    res.json(links);
  });
};