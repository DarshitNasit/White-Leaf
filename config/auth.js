const Article = require("../models/ARTICLE");

module.exports = {
  notLogin: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("danger", "You have already logged in.");
      res.redirect("/");
    } else next();
  },

  isLogin: (req, res, next) => {
    if (req.isAuthenticated()) next();
    else {
      req.flash("danger", "Please login first.");
      res.redirect("/users/login");
    }
  },

  isValidUser: (req, res, next) => {
    if (!req.user) {
      req.flash("danger", "Please login first.");
      res.redirect("/users/login");
    } else if (req.isAuthenticated() && req.user._id == req.params.id) next();
    else if (req.user.email == process.env.MY_EMAIL) next();
    else {
      req.flash("danger", "You are not eligible.");
      res.redirect("/");
    }
  },

  isValidUserArticle: (req, res, next) => {
    if (!req.user) {
      req.flash("danger", "Please login first.");
      return res.redirect("/users/login");
    }

    Article.findById(req.params.id)
      .then((curr_article) => {
        if (!curr_article) {
          req.flash("danger", "Article not found.");
          res.redirect("/");
        } else if (req.user.email == process.env.my_email) next();
        else if (curr_article.author_id == req.user._id) next();
        else {
          req.flash("danger", "You are not eligible.");
          return res.redirect("/");
        }
      })
      .catch((err) => console.log(err));
  },

  isAdmin: (req, res, next) => {
    if (
      typeof req.user != "undefined" &&
      req.user.email === process.env.MY_EMAIL
    )
      next();
    else {
      req.flash("danger", "You are not eligible.");
      res.redirect("/");
    }
  },
};
