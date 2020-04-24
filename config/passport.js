const bcrypt = require("bcryptjs");
const User = require("../models/USER");
const localStrategy = require("passport-local").Strategy;

module.exports = (passport) => {
  passport.use(
    new localStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email })
        .then((curr_user) => {
          if (!curr_user)
            return done(null, false, {
              type: "danger",
              message: "Invalid Email ID",
            });
          else {
            bcrypt.compare(password, curr_user.password, (err, isMatch) => {
              if (err) done(err, false);
              else if (isMatch)
                return done(null, curr_user, {
                  type: "success",
                  message: "You have successfully logged in",
                });
              else
                return done(null, false, {
                  type: "danger",
                  message: "Incorrect Password",
                });
            });
          }
        })
        .catch((err) => done(err, false));
    })
  );

  passport.serializeUser((curr_user, done) => {
    done(null, curr_user.id);
  });

  passport.deserializeUser((uid, done) => {
    User.findById(uid, (err, curr_user) => {
      if (err) done(err);
      else done(null, curr_user);
    });
  });
};
