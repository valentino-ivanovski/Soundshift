const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();
const path = require('path');

app.use(express.json());

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'views')));

app.use(express.urlencoded({ extended: true }));

const secretKey = require('crypto').randomBytes(32).toString('hex');
// Configure express-session middleware
app.use(session({
  secret: secretKey, // Change this to a secure secret key
  resave: false,
  saveUninitialized: true,
}));

function requireLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.admin === 1) {
      next();
  } else {
      res.redirect('/mainpage');
  }
}

//SWAP THESE WHEN DONE WITH TESTING

function requireNotAdmin(req, res, next) {
  if (req.session.user && req.session.user.admin === 0) {
      next();
  } else {
      res.redirect('/adminMainpage');
  }
}

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});


app.get('/', (req, res) => {
  console.log("Page started/refreshed")
  res.render("index");
});

app.get('/logout', (req, res) => {
    //clear the user session to log out
    req.session.user = null;
    res.redirect('/');
  });

//routing
const loginRouter = require('./routes/login');
app.use("/login", loginRouter);

const registerRouter = require('./routes/register');
app.use("/register", registerRouter);

const mainpageRouter = require('./routes/mainpage');
app.use("/mainpage", requireLogin, requireNotAdmin, mainpageRouter);

const profileRouter = require('./routes/profile');
app.use("/profile", requireLogin, requireNotAdmin, profileRouter);

const searchRouter = require('./routes/search');
app.use("/search", requireLogin, requireNotAdmin, searchRouter);

const adminMainpageRouter = require('./routes/adminMainpage');
app.use("/adminMainpage", requireLogin, requireAdmin, adminMainpageRouter);

const adminSearchRouter = require('./routes/adminSearch');
app.use("/adminSearch", requireLogin, requireAdmin, adminSearchRouter);

const adminProfileRouter = require('./routes/adminProfile');
app.use("/adminProfile", requireLogin, requireAdmin, adminProfileRouter);

const adminSongsListRouter = require('./routes/adminSongsList');
app.use("/adminSongsList", requireLogin, requireAdmin, adminSongsListRouter);

const adminUsersListRouter = require('./routes/adminUsersList');
app.use("/adminUsersList", requireLogin, requireAdmin, adminUsersListRouter);

const adminCommentsListRouter = require('./routes/adminCommentsList');
app.use("/adminCommentsList", requireLogin, requireAdmin, adminCommentsListRouter);

const adminReportsListRouter = require('./routes/adminReportsList');
app.use("/adminReportsList", requireLogin, requireAdmin, adminReportsListRouter);


app.listen(3000);
