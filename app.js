require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes');
const passport = require('passport');
const bcrypt = require('bcrypt');
const strategy = require('./config/jwtOptions');
const LocalStrategy = require('passport-local').Strategy;
const database = require('./config/database');
const bodyParser = require('body-parser');
const User = require('./models/user/user.schema');
app.use(cors());

require('./config/passport');

// Database 
database;

// parse application/json
app.use(bodyParser.json({
	verify: (req, res, buf) => {
	  req.rawBody = buf
	}}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
	next();
});


//routes
app.use('/', authRoutes);

// Serve the public assets to all authenticated users
app.use('/public', express.static(__dirname + '/public'));

//index page
app.get('/', function (_req, res) {
	res.status(404);
	res.sendFile(path.join(__dirname + "/public/index.html"));
});

// throw 404 if URL not found
app.all("*", function (_req, res) {
	res.status(404);
	res.sendFile(path.join(__dirname + "/public/404.html"));
});

module.exports = app;