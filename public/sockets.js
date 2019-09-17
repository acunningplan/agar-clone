let socket = io.connect("http://localhost:8080");

// User clicks start
const init = () => {
  draw();
  socket.emit("init", {
    playerName: player.name
  });
};

socket.on("initReturn", data => {
  orbs = data.orbs;
  setInterval(() => {
    socket.emit('tick', {
      xVector: player.xVector,
      yVector: player.yVector
    })
  }, 33)
});

socket.on("tock", data => {
  players = data.players;
  player.locX = data.playerX
  player.locY = data.playerY
});

socket.on('orbSwitch', data => {
  orbs.splice(data.orbIndex, 1, data.newOrb)
})
