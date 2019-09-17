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
  defaultOrbs: 5000,
  defaultSpeed: 6,
  defaultSize: 6,
  defaultZoom: 1.5,
  worldWidth: 5000,
  worldHeight: 5000
};

const initGame = () => {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
};

initGame();

// Issue a message at 30 fps (every 33 ms)
setInterval(() => {
  if (players.length > 0) {
    io.to("game").emit("tock", {
      players
    });
  }
}, 33);

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
      socket.emit("tickTock", {
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
        (player.playerData.locX > settings.worldWidth && xV > 0)
      ) {
        player.playerData.locY -= speed * yV;
      } else if (
        (player.playerData.locY < 5 && yV > 0) ||
        (player.playerData.locY > settings.worldHeight && yV < 0)
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

          io.sockets.emit("updateLeaderBoard", getLeaderBoard());
          io.sockets.emit("orbSwitch", orbData);
        })
        .catch(() => {});

      // Player collisions
      let playerDeath = checkForPlayerCollisions(
        player.playerData,
        player.playerConfig,
        player.socketId
      );

      playerDeath
        .then(data => {
          io.sockets.emit("updateLeaderBoard", getLeaderBoard());
          io.sockets.emit('playerDeath', data)
        })

        .catch(() => {});
    }
  });
  socket.on("disconnect", data => {
    if (player.playerData) {
      players.forEach((currentPlayer, i) => {
        if (currentPlayer.uid == player.playerData.uid) {
          players.splice(i, 1);
          io.sockets.emit("updateLeaderBoard", getLeaderBoard());
        }
      });
      const updateStats = `
      UPDATE stats
        SET highScore = CASE WHEN highScore < ? THEN ? ELSE highScore END,
        mostOrbs = CASE WHEN mostOrbs < ? THEN ? ELSE mostOrbs END,
        mostPlayers = CASE WHEN mostPlayers < ? THEN ? ELSE mostPlayers END
      WHERE username = ?
      `;
    }
  });
});

const getLeaderBoard = () => {
  players.sort((a, b) => {
    return b.score - a.score;
  });
  let leaderBoard = players.map(currentPlayer => {
    return {
      name: currentPlayer.name,
      score: currentPlayer.score
    };
  });
  return leaderBoard;
};

module.exports = io;
