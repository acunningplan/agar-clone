const io = require("../servers").io;
const Orb = require("./classes/Orb");

let orbs = [];

const initGame = () => {
  for (let i = 0; i < 500; i++) {
    orbs.push(new Orb());
  }
};

io.sockets.on("connect", socket => {
  socket.emit("init", {
    orbs
  });
});

initGame();

module.exports = io;
