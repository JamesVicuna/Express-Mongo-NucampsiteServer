const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
   return jwt.sign(user, config.secretKey, {expiresIn: 36000});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
   new JwtStrategy(
      opts,
      (jwt_payload, done) => {
         console.log('JWT payload', jwt_payload);
         User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
               return done(err, false);
            }else if (user) {
               return done(null, user);
            } else {
               return done(null, false);
            }
         })
      }
   )
)

exports.verifyUser = passport.authenticate('jwt', {session: false});

// Task: Create and export a function to verify if a User is an admin
// user.admin : Boolean
// VERIFY: user.admin === true, if so then let them proceed to next() middleware ie 
// if user.admin !== true  then log an error 403
exports.verifyAdmin = (req, res, next) => {
   if (req.user.admin === true) {
      return next();
   } else {
      const err = new Error('You are not authorized to perform this operation! MUST BE AN ADMIN')
      err.statusCode = 403;
      return next(err);
   } 
}