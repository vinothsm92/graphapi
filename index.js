const express = require('express');
const os = require('os');


var config = require("./configuration/config")
var bodyParser = require('body-parser');
const passport = require('passport');
var app = express()
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/', express.static('./build'));
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var FacebookStrategy = require('passport-facebook').Strategy;

var request = require('request');

var apires
var redirurl=""
var token = "";
var profileId = [];
var pages = [];
var pagesPost = []

passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,//use client id 
  clientSecret: config.facebook_api_secret,// use client secret
  callbackURL: "http://localhost:8080/facebook/callback"
},
  function (accessToken, refreshToken, profile, cb) {
    token = accessToken;
    profileId = profile;
   
  }
));



app.get('/facebook/auth',

  passport.authenticate('facebook')

);

app.get("/facebook/callback", passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  }
)

app.get('/token', passport.authenticate('facebook'),(req,res)=>{
  setTimeout(() => {
    var a= token
    res.send("token generated : please redirect to '/get_fb_profile'")
  }, 1000);
})


app.get('/get_fb_profile', function (req, res) {
  redirurl='/get_fb_profile'
  apires=res
  if (token) {
    var URL = "https://graph.facebook.com/v7.0/" + profileId.id + "/accounts?access_token=" + token
    request(URL, (req, res) => { //getting total pages with my profile id
      pages = JSON.parse(res.body)


      var counts = 0
      var arr = [];
      for (i = 0; i < pages.data.length; i++) {
        var URL = "https://graph.facebook.com/v7.0/" + pages.data[i].id + "/posts?access_token=" + token
        request(URL, (req, res) => { //getting videos id with my page id
          counts++
          pagesPost = JSON.parse(res.body)
          var data = " page No : " + counts + " post count : " + pagesPost.data.length;
          arr.push(data)
          if (counts == pages.data.length) {
            apires.send(arr)       //need to count the like/shares with the video id  
          }
        })
      }

    })
  }
  else {
    res.redirect('/facebook/auth')
  }
});


app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

