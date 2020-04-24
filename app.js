require("dotenv").config();

// All needed Modules
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const multer = require("multer");
const uuid = require("uuid");

// Launching App
const app = express();

// View Engine, Body Parser, Static Folder
app.set("view engine", "pug");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Connect To DataBase
mongoose
  .connect(process.env.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected ..."))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);

// Session
app.use(
  session({
    secret: process.env.secret,
    resave: true,
    saveUninitialized: true,
  })
);

// Connect Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Passport
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use("*", (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.my_email = process.env.my_email;
  next();
});

// Redirect routes
app.get("/login", (req, res) => res.redirect("/users/login"));
app.get("/logout", (req, res) => res.redirect("/users/logout"));
app.get("/register", (req, res) => res.redirect("/users/register"));
app.get("/profile", (req, res) => res.redirect("/users/view-profile"));

// Set Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/pictures", require("./routes/pictures"));
app.use("/articles", require("./routes/articles"));

// Launching server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
