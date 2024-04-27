const express = require('express');
const http = require('http');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const { auth } = require('express-openid-connect');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: '680776974175-ltcaroqttomqjb9afvkeg9kmlc87grtq.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/auth/callback',
},
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.get('/', function (req, res) {
  res.render('index', {
    title: 'Google OAuth Webapp Sample Nodejs',
    isAuthenticated: req.isAuthenticated()
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })

);

app.get('/auth/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) { 
    const userProfile = req.user;
    console.log('user profile : ',userProfile)
    res.redirect('/profile');
  }
);
app.get('/logout', function (req, res) {
  req.session.passport = null;
  res.redirect('/');
});


app.get('/profile', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('profile', {
      userProfile: JSON.stringify(req.user, null, 2),
      title: 'Profile page'
    });
  } else {
    res.redirect('/auth/google');
  }
});

const port = process.env.PORT || 3000;

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
