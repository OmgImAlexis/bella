var express = require('express'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('./config.js').config;

var app = express()

var accessLogStream = fs.createWriteStream(__dirname + '/../access.log', {
    flags: 'a'
});

mongoose.connect(config.db.uri + ':' + config.db.port + '/' + config.db.database, function() {
    console.error('Connected to MongoDB.');
});
mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

app.use(morgan('combined', {
    stream: accessLogStream
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: config.session.secret,
    name: config.session.name,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(__dirname + '/../public'));

app.use('/', require('./routes/web.js'));
app.use('/api/', require('./routes/api.js'));

app.get('*', function(req, res) {
    res.render('http/404');
});

var server = app.listen(config.app.port, function() {
    console.log('Listening on port %d', server.address().port);
});
