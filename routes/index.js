const router = require("express").Router();
const User = require("../models/USER");
const Article = require("../models/ARTICLE");
const reset_session = require("../config/auth_session");

// Home Route
router.get("/", (req, res, next) => {
  const delete_session = ["url", "email"];
  reset_session(req, delete_session);

  User.find({}, (err, all_users) => {
    if (err) return console.log(err);

    Article.find({}, (err, all_articles) => {
      if (err) return console.log(err);

      const articleAuthor = [];
      all_users.forEach((curr_user) => {
        all_articles.forEach((curr_article) => {
          if (curr_article.author_id == curr_user._id)
            articleAuthor.push({
              id: curr_article._id,
              title: curr_article.title,
              name: curr_user.fname + " " + curr_user.lname,
            });
        });
      });
      res.render("index", { articleAuthor });
    });
  });
});

module.exports = router;
