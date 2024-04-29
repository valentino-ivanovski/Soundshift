const express = require('express');
const session = require('express-session'); // Import express-session
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

// Middleware to check if the user is logged in
function requireLogin(req, res, next) {
  if (req.session.user) {
    next(); // Continue to the next middleware or route
  } else {
    res.redirect('/login'); // Redirect to the login page if the user is not logged in
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
    // Clear the user session to log out
    req.session.user = null;
    res.redirect('/');
  });

// Routing
const loginRouter = require('./routes/login');
app.use("/login", loginRouter);

const registerRouter = require('./routes/register');
app.use("/register", registerRouter);

const mainpageRouter = require('./routes/mainpage');
app.use("/mainpage", requireLogin, mainpageRouter);

const profileRouter = require('./routes/profile');
app.use("/profile", requireLogin, profileRouter);

const searchRouter = require('./routes/search');
app.use("/search", requireLogin, searchRouter);

app.listen(3000);
