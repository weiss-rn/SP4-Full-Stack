var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const override = require('method-override');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://localhost:27017/crud-mahasiswa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
}); 

app.set('views', path.join(__dirname, '..', 'view'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(override('_method'));

app.use(
  session({
    secret: 'cat keyboard',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);
app.use(flash());

// Routes
const mahasiswaRoutes = require('../routes/mahasiswa');
app.use('/mahasiswa', mahasiswaRoutes);

app.get('/', function(req, res) {
  res.render('index', { title: 'CRUD Mahasiswa', mahasiswa: [], message: {} });
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
