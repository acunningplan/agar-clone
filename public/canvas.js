player.locX = Math.floor(500 * Math.random() + 100);
player.locY = Math.floor(500 * Math.random() + 100);

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(1, 0, 0, 1, 0, 0);

  const camX = -player.locX + canvas.width / 2;
  const camY = -player.locY + canvas.height / 2;
  context.translate(camX, camY);

  players.forEach(p => {
    context.beginPath();
    context.fillStyle = p.color;
    // Draw a circular arc (specify center, radius, starting and ending angles)
    context.arc(p.locX, p.locY, p.radius, 0, Math.PI * 2);
    context.arc(200, 200, 0, 0, Math.PI * 2);
    context.fill();
    context.linewidth = 3;
    context.strokeStyle = "rgb(0, 255, 0)";
    context.stroke();
  });

  orbs.forEach(orb => {
    context.beginPath();
    context.fillStyle = orb.color;
    context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    context.fill();
  });

  // Recursively call "draw" for every frame
  requestAnimationFrame(draw);
};

canvas.addEventListener("mousemove", event => {
  const mousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  const angleDeg =
    (Math.atan2(
      mousePosition.y - canvas.height / 2,
      mousePosition.x - canvas.width / 2
    ) *
      180) /
    Math.PI;

  // Determine which quadrant the cursor is in
  if (angleDeg >= 0 && angleDeg < 90) {
    xVector = 1 - angleDeg / 90;
    yVector = -(angleDeg / 90);
  } else if (angleDeg >= 90 && angleDeg <= 180) {
    xVector = -(angleDeg - 90) / 90;
    yVector = -(1 - (angleDeg - 90) / 90);
  } else if (angleDeg >= -180 && angleDeg < -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 + (angleDeg + 90) / 90;
  } else if (angleDeg < 0 && angleDeg >= -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 - (angleDeg + 90) / 90;
  }

  player.xVector = xVector;
  player.yVector = yVector;


});
