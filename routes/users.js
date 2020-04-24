const fs = require("fs");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/USER");
const Article = require("../models/ARTICLE");
const promisify = require("util").promisify;
const deleteFile = promisify(fs.unlink);
const reset_session = require("../config/auth_session");
const { notLogin, isLogin, isValidUser } = require("../config/auth");

// Login Get
router.get("/login", notLogin, (req, res, next) => {
  res.render("login", { email: req.session.email });
  delete req.session.email;
});

// Login Post
router.post("/login", notLogin, (req, res, next) => {
  req.session.email = req.body.email;
  passport.authenticate("local", {
    successFlash: true,
    successRedirect: "/",
    failureFlash: true,
    failureRedirect: "/users/login",
  })(req, res, next);
});

// Logout
router.get("/logout", isLogin, (req, res, next) => {
  req.logout();
  req.flash("success", "You have successfully logged out");
  res.redirect("/users/login");
});

// Register Get
router.get("/register", notLogin, (req, res, next) => res.render("register"));

// Register Post
router.post("/register", notLogin, (req, res, next) => {
  const { fname, lname, email, password, password2 } = req.body;

  if (password !== password2) {
    req.flash("danger", "Passwords do not match. Try again.");
    return res.render("register", { fname, lname, email });
  }

  User.findOne({ email: email })
    .then((curr_user) => {
      if (curr_user) {
        req.flash("danger", "Email ID is already registered");
        return res.render("register", { fname, lname });
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.log(err);

        bcrypt.hash(password, salt, (err, hashed) => {
          if (err) console.log(err);

          const new_user = new User({ fname, lname, email, password: hashed });
          new_user
            .save()
            .then(() => {
              req.flash(
                "success",
                "Successfully Registered. Now you can login."
              );
              res.redirect("/users/login");
            })
            .catch((err) => console.log(err));
        });
      });
    })
    .catch((err) => console.log(err));
});

// Get All Users
router.get("/all-users", (req, res, next) => {
  const delete_session = ["url", "email"];
  reset_session(req, delete_session);

  User.find({}, (err, all_users) => {
    if (err) console.log(err);

    all_users.sort((a, b) => {
      const nameA = a.fname.toUpperCase();
      const nameB = b.fname.toUpperCase();
      if (nameA < nameB) return -1;
      else if (nameA > nameB) return 1;
      else {
        const lnameA = a.lname.toUpperCase();
        const lnameB = b.lname.toUpperCase();
        if (lnameA < lnameB) return -1;
        else if (lnameA > lnameB) return 1;
      }
    });
    res.render("all_users", { all_users });
  });
});

// View Profile
router.get("/view-profile", isLogin, (req, res, next) =>
  res.redirect(`/users/view-profile/${req.user._id}`)
);

// View Profile with id
router.get("/view-profile/:id", (req, res, next) => {
  const delete_session = ["url", "email"];
  reset_session(req, delete_session);

  const uid = req.params.id;

  User.findOne({ _id: uid }, (err, curr_user) => {
    if (err) console.log(err);

    if (!curr_user) {
      req.flash("danger", "User not found.");
      return res.redirect("/");
    }

    Article.find({ author_id: uid })
      .then((curr_articles) => {
        curr_articles.sort((a, b) => {
          const nameA = a.title.toUpperCase();
          const nameB = b.title.toUpperCase();
          if (nameA < nameB) return -1;
          else if (nameA > nameB) return 1;
          return 0;
        });
        res.render("profile", { curr_user, curr_articles });
      })
      .catch((err) => console.log(err));
  });
});

// Edit Profile Get
router.get("/edit-profile/:id", isValidUser, (req, res, next) => {
  const delete_session = ["url", "email"];
  reset_session(req, delete_session);

  const uid = req.params.id;

  User.findOne({ _id: uid })
    .then((curr_user) => {
      if (!curr_user) {
        req.flash("danger", "No user found");
        return res.redirect("/");
      }
      res.render("edit_profile", { curr_user });
    })
    .catch((err) => console.log(err));
});

// Edit Profile Post
router.post("/edit-profile/:id", isValidUser, (req, res, next) => {
  const uid = req.params.id;

  let { fname, lname, password, new_password, new_password2 } = req.body;
  User.findOne({ _id: uid })
    .then((curr_user) => {
      bcrypt.compare(password, curr_user.password, (err, isMatch) => {
        if (err) console.log(err);

        if (!isMatch && req.user.email != process.env.my_email) {
          req.flash("danger", "Incorrect Password.");
          return res.redirect(`/users/edit-profile/${curr_user._id}`);
        }

        if (new_password !== "" && new_password !== new_password2) {
          req.flash("danger", "New passwords do not match.");
          return res.redirect(`/users/edit-profile/${curr_user._id}`);
        }

        if (new_password === "" && req.user.email !== process.env.my_email)
          new_password = password;

        bcrypt.genSalt(10, (err, salt) => {
          if (err) console.log(err);

          if (req.user.email === process.env.my_email && new_password === "") {
            User.updateOne({ _id: uid }, { fname, lname })
              .then(() => {
                req.flash("success", "Profile updated successfully.");
                res.redirect(`/users/view-profile/${curr_user._id}`);
              })
              .catch((err) => console.log(err));
          } else {
            bcrypt.hash(new_password, salt, (err, hashed) => {
              if (err) console.log(err);

              User.updateOne({ _id: uid }, { fname, lname, password: hashed })
                .then(() => {
                  req.flash("success", "Profile updated successfully.");
                  res.redirect(`/users/view-profile/${curr_user._id}`);
                })
                .catch((err) => console.log(err));
            });
          }
        });
      });
    })
    .catch((err) => console.log(err));
});

// Delete Profile
router.get("/delete-profile/:id", isValidUser, (req, res, next) => {
  const delete_session = ["url", "email"];
  reset_session(req, delete_session);

  const uid = req.params.id;
  if (req.user._id == uid) req.logout();

  User.findOne({ _id: uid })
    .then((curr_user) => {
      if (!curr_user) {
        req.flash("danger", "No user found.");
        return res.redirect("/");
      }

      Article.find({ author_id: uid })
        .then((curr_articles) => {
          curr_articles.forEach((curr_article) => {
            curr_article.images.forEach((image) => {
              deleteFile(`./public/images/${image}`)
                .then()
                .catch((err) => console.log(err));
            });
          });

          Article.deleteMany({ author_id: uid })
            .then()
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  User.deleteOne({ _id: uid })
    .then(() => {
      req.flash("success", "User deleted successfully.");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
