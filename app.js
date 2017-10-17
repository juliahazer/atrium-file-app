var express = require('express');
var app = express();
var path = require('path');
require('dotenv').config();
var bodyParser = require("body-parser");
var userRoutes = require("./routes/users");
var fileRoutes = require("./routes/files");
var session = require("cookie-session");
var flash = require("connect-flash");
var passport = require("passport");

app.set("view engine", "pug");
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:process.env.SECRET_KEY}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// send flash messages to all routes
app.use(function(req, res, next){
    res.locals.message = req.flash('message');
    next();
});

app.use('/users', userRoutes);
app.use('/files', fileRoutes);

app.get('/', function(req,res){
  res.redirect('/users/login');
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000");
});
