const io = require("../servers").io;
const Player = require("./classes/Player");
const PlayerConfig = require("./classes/PlayerConfig");
const PlayerData = require("./classes/PlayerData");
const Orb = require("./classes/Orb");

const checkForOrbCollisions = require("./checkCollisions")
  .checkForOrbCollisions;
const checkForPlayerCollisions = require("./checkCollisions")
  .checkForPlayerCollisions;

let orbs = []; // Contains data for every orb
let players = []; // Contains data for every player

let settings = {
  defaultOrbs: 500,
  defaultSpeed: 6,
  defaultSize: 6,
  defaultZoom: 1.5,
  worldWidth: 500,
  worldHeight: 500
};

const initGame = () => {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
};

initGame();

io.sockets.on("connect", socket => {
  let player = {};
  // A player has connected
  socket.on("init", data => {
    // Add player to game namespace
    socket.join("game");
    // Make a player config object
    let playerConfig = new PlayerConfig(settings);
    let playerData = new PlayerData(data.playerName, settings);
    player = new Player(socket.id, playerConfig, playerData);

    // Issue a message at 30 fps (every 33 ms)
    setInterval(() => {
      io.to("game").emit("tock", {
        players,
        playerX: player.playerData.locX,
        playerY: player.playerData.locY
      });
    }, 33);

    socket.emit("initReturn", {
      orbs
    });
    players.push(playerData);
  });
  // Player has moved the mouse, we should move canvas accordingly

  socket.on("tick", data => {
    if (player.playerConfig) {
      speed = player.playerConfig.speed;

      // Update player config object with new direction and set new local variable for readability
      xV = player.playerConfig.xVector = data.xVector;
      yV = player.playerConfig.yVector = data.yVector;

      if (
        (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
        (player.playerData.locX > 500 && xV > 0)
      ) {
        player.playerData.locY -= speed * yV;
      } else if (
        (player.playerData.locY < 5 && yV > 0) ||
        (player.playerData.locY > 500 && yV < 0)
      ) {
        player.playerData.locX += speed * xV;
      } else {
        player.playerData.locX += speed * xV;
        player.playerData.locY -= speed * yV;
      }

      let capturedOrb = checkForOrbCollisions(
        player.playerData,
        player.playerConfig,
        orbs,
        settings
      );

      capturedOrb
        .then(data => {
          const orbData = {
            orbIndex: data,
            newOrb: orbs[data]
          };
          console.log(orbData);
          io.sockets.emit("orbSwitch", orbData);
        })
        .catch(() => {});
    }
  });
});

module.exports = io;
