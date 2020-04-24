const mongoose = require("mongoose");

articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author_id: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
  },
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
