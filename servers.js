const express = require("express");
const socketio = require("socket.io");

const app = express();
app.use(express.static(__dirname + "/public"));
const expressServer = app.listen(8080);
const io = socketio(expressServer);
const helmet = require("helmet");
app.use(helmet());
console.log("Express and socket io are listening on port 8080");


module.exports = {
  app, io
}