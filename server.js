const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const mongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportSocketIo = require('passport.socketio');

const config = require('./config/secert');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


mongoose.connect(config.database, function (err) {
  if (err) console.log(err);
  console.log('connected to DB');
});

app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: new mongoStore({ url: config.database , autoReconnect: true })
}));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res,next)=>{
  res.locals.user = req.user;
  next();
});
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'connect.sid',
  secret: config.secret,
  store: new mongoStore({ url: config.database , autoReconnect: true }),
  sucess: onAuthriceSuccess,
  fail: onAuthriceFail
}));

function onAuthriceSuccess(data, accept) {
  console.log('Successful connection');
  accept();
}

function onAuthriceFail(data, message, error, accept) {
  console.log('failed connection');
  if (error) accept(new Error(message));
}

require('./realtime/io')(io);

const mainRoutes = require('./routes/main');
const userRoute = require('./routes/users');
const accountRoute = require('./routes/account');

app.use(mainRoutes);
app.use('/user', userRoute);
app.use('/account', accountRoute);

http.listen(3030, err => {
  if (err) console.log(err);
  console.log(`Running on port 3030 `);
})