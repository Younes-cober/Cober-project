const LocalStrategy = require("passport-local").Strategy;

const User = require("../app/models/user");

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Admin signUp
  passport.use(
    "admin-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        User.findOne({ "local.email": email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(
              null,
              false,
              req.flash("signupMessage", "The Email is already taken")
            );
          } else {
            var newAdmin = new User(); // creamos modelo de usuario
            newAdmin.local.name = req.body.name;
            newAdmin.local.email = email;
            newAdmin.local.password = newAdmin.generateHash(password);
            newAdmin.local.admin = true;
            newAdmin.save(function (err) {
              if (err) {
                throw err;
              } else {
                return done(null, newAdmin);
              }
            });
          }
        });
      }
    )
  );

  // Admin Login
  passport.use(
    "admin-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        User.findOne({ "local.email": email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(
              null,
              false,
              req.flash("adminloginMessage", "No Admin found.")
            );
          }

          if (!user.validatePassword(password)) {
            return done(
              null,
              false,
              req.flash("adminloginMessage", "Wrong password")
            );
          }
          return done(null, user); // returnan callback con un null en error y un usuario
        });
      }
    )
  );

  // para el signup
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        User.findOne({ "local.email": email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(
              null,
              false,
              req.flash("signupMessage", "The Email is already taken")
            );
          } else {
            var newUser = new User(); // creamos modelo de usuario
            newUser.local.name = req.body.name;
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.local.admin = false;
            newUser.save(function (err) {
              if (err) {
                throw err;
              } else {
                return done(null, newUser);
              }
            });
          }
        });
      }
    )
  );
  // para el Login
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        User.findOne({ "local.email": email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found.")
            );
          }

          if (!user.validatePassword(password)) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Wrong password")
            );
          }
          return done(null, user); // returnan callback con un null en error y un usuario
        });
      }
    )
  );
};
