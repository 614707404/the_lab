var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const client = require('./services/grpcClient.js');
const WebSocket = require('ws');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors());
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
let vue_client = null;
wss.on('connection', ws => {
  vue_client = ws
  console.log('WebSocket connection established.');

  ws.on('message', message => {
    console.log('Received message: ' + message);
    ws.send('Message received: ' + message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});


// 在全局范围内开始双工调用
const call = client.BidirectionalStream();

// Listen for messages from the server
call.on('data', function(ServerMessage) {
  vue_client.send(JSON.stringify(ServerMessage));
  // console.log('Received message from server: ' + ServerMessage);
});

call.on('error', function(e) {
  console.log('Error: ' + e.message);
});

// 创建一个接口来处理 Vue 应用的请求
app.post('/play_pause', (req, res) => {
  console.log('isPlaying:', req.body.isPlaying);

   // Send a message with the new isPlaying value
   call.write({ message: req.body.isPlaying ? "play" : "pause"});

   // Respond to the request
   res.json({
     message: '请求已接收，isPlaying：' + req.body.isPlaying
   });
});

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
