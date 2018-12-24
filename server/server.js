const express = require('express');
const app = express();
const port = 3000;
const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');

const socket_io = require('socket.io');
const io = socket_io();
const editorSocketService = require('./services/socketService')(io);

mongoose.connect('mongodb://admin:admin01@ds139334.mlab.com:39334/coj', {
  useNewUrlParser: true
});

app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use('/api/v1', restRouter);

app.use( (req, res)=> {
  res.sendFile("index.html", {root: path.join(__dirname, '../public/')});
});

// app.listen(port, () => console.log(`example app listening on port ${port}!`));

const server = http.createServer(app);
io.attach(server);

server.listen(port);

server.on('err', onError);
server.on('listening', onListening);

// let onError = err => {
//   throw err;
// }


// const onListening = () => {
//   const addr = server.address();
//   const bind = typeof addr == 'string' ?
//     'pipe' + addr :
//     'port' + addr.port;
//   console.log('Listening on ' + bind);
// }

function onError (err) {
  console.log(err);
  throw err;
}

function onListening () {
  const addr = server.address();
  const bind = typeof addr == 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  console.log('Listening on ' + bind);
}