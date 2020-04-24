const fs = require("fs");
const router = require("express").Router();
const upload = require("../config/multer");
const User = require("../models/USER");
const Article = require("../models/ARTICLE");
const promisify = require("util").promisify;
const deleteFile = promisify(fs.unlink);
const { notLogin, isLogin, isValidUserArticle } = require("../config/auth");

// View Article
router.get("/view-article/:id", (req, res, next) => {
  const aid = req.params.id;

  Article.findById(aid)
    .then((curr_article) => {
      if (!curr_article) {
        req.flash("danger", "No article found.");
        return res.redirect("/");
      }

      User.findById(curr_article.author_id)
        .then((curr_user) => {
          const curr_author = curr_user.fname + " " + curr_user.lname;
          res.render("article", { curr_article, curr_author });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// Add Article Get
router.get("/add-article", isLogin, (req, res, next) =>
  res.render("add_article")
);

// Add Article Post
router.post(
  "/add-article",
  isLogin,
  upload.array("images"),
  (req, res, next) => {
    const new_article = new Article({
      title: req.body.title,
      author_id: req.user._id,
      body: req.body.body,
      images: [],
    });
    req.files.forEach((image) => new_article.images.push(image.filename));

    new_article
      .save()
      .then(() => {
        req.flash("success", "Article added successfully.");
        res.redirect(`/articles/view-article/${new_article._id}`);
      })
      .catch((err) => console.log(err));
  }
);

// Edit Article Get
router.get("/edit-article/:id", isValidUserArticle, (req, res, next) => {
  const aid = req.params.id;
  Article.findById(aid)
    .then((curr_article) => {
      if (!curr_article) {
        req.flash("danger", "No article found.");
        return res.redirect("/");
      }
      res.render("edit_article", { curr_article });
    })
    .catch((err) => console.log(err));
});

// Edit Article Post
router.post(
  "/edit-article/:id",
  isValidUserArticle,
  upload.array("images"),
  (req, res, next) => {
    const aid = req.params.id;
    const new_article = {
      title: req.body.title,
      body: req.body.body,
    };

    Article.updateOne({ _id: aid }, new_article)
      .then(() => {
        const images = [];
        req.files.forEach((image) => images.push(image.filename));

        Article.updateOne(
          { _id: aid },
          { $push: { images: { $each: images } } }
        )
          .then(() => {
            req.flash("success", "Article updated successfully.");
            res.redirect(`/articles/view-article/${aid}`);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

// Delete Article
router.get("/delete-article/:id", isValidUserArticle, (req, res, next) => {
  const aid = req.params.id;
  Article.findByIdAndDelete(aid)
    .then((curr_article) => {
      if (!curr_article) {
        req.flash("danger", "No article found.");
        return res.redirect("/");
      } else {
        curr_article.images.forEach((image) => {
          deleteFile(`./public/images/${image}`)
            .then()
            .catch((err) => console.log(err));
        });

        req.flash("success", "Article deleted successfully.");
        res.redirect(`/users/view-profile/${req.user._id}`);
      }
    })
    .catch((err) => console.log(err));
});

// Delete image
router.get("/delete-image/:id/:index", isValidUserArticle, (req, res, next) => {
  const aid = req.params.id;
  const index = req.params.index;

  Article.findById(aid)
    .then((curr_article) => {
      if (!curr_article) {
        req.flash("danger", "Article not found.");
        return res.redirect("/");
      }

      const image = curr_article.images[index];
      deleteFile(`./public/images/${curr_article.images[index]}`);

      Article.updateOne({ _id: aid }, { $pull: { images: image } })
        .then(() => {
          req.flash("success", "Image deleted successfully.");
          res.redirect(`/articles/edit-article/${aid}`);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

module.exports = router;
