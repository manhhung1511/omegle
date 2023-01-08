const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketServices = require('./src/services/chat.service');
const port = process.env.PORT || 3000;

let sockets = [];
let searching = [];
let notAvailable = [];

global.__basedir  =  __dirname;
global.__io  =  io;
global.__sockets = sockets;
global.__searching = searching;
global.__notAvailable = notAvailable;


app.use(express.static(__dirname + "/public"));
app.use(require('./src/routes/chat.route'));


io.on('connection', SocketServices.connection);

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

