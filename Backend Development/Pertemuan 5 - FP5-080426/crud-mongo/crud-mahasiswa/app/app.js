var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.set('views', path.join(__dirname, '..', 'view'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', function(req, res) {
    res.render('index', { title: 'CRUD Mahasiswa' });
});

app.use(function(req, res, next) {
    res.status(404);
    next(new Error('Not Found'));
});

app.use(function(error, req, res, next) {
    res.status(error.status || 500);
    res.type('text').send(req.app.get('env') === 'development' ? error.message : 'Internal Server Error');
});

module.exports = app;
