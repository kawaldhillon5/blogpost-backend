var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const clientRouter = require("./routes/client");
var indexRouter = require('./routes/index');
const editorRouter = require("./routes/editor");
const authRouter = require('./routes/auth');
const session = require("express-session");
const passport = require("passport");
const MongoStore = require('connect-mongo');
const cors = require("cors");
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://dhillonzeus:6357Jv7t3TPHTyor@cluster0.dvd8zsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(session({ 
  secret: "cats", 
  resave: false, 
  saveUninitialized: false,
  store: MongoStore.create(
    {mongoUrl:mongoDB}
    ),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, 
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/client', clientRouter);
app.use('/editor', editorRouter);
app.use('/authenticate', authRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
