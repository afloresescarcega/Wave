function logKey(e) {
  if (e.keyCode == '38') {
    // up arrow
    console.log("Up");
    deltaPosY = deltaPosY + hh;
    document.getElementById("row" + mod(indexY + 2, 3)).style.position = "absolute";
    document.getElementById("row" + mod(indexY + 2, 3)).style.top = -deltaPosY + "px";
    let animations = anime({
      targets: ".block",
      translateY: deltaPosY,
      easing: 'spring(1, 80, 10, 0)'
    });
    logPos();
    indexY -= 1;
    $("#row" + mod(indexY + 2, 3)).children(":first").html("" + indexY);
    console.log("X: " + indexX + " Y: " + indexY);
  } else if (e.keyCode == '40') {
    // down arrow
    console.log("Down");
    deltaPosY = deltaPosY - hh;
    document.getElementById("row" + mod(indexY + 2, 3)).style.position = "absolute";
    document.getElementById("row" + mod(indexY + 2, 3)).style.top = -deltaPosY + hh + "px";
    let animation = anime({
      targets: '.block',
      translateY: deltaPosY,
      easing: 'spring(1, 80, 10, 0)'
    });
    logPos();
    indexY += 1;
    $("#row" + mod(indexY + 2, 3)).children(":first").html("" + indexY);
    console.log("X: " + indexX + " Y: " + indexY);
  } else if (e.keyCode == '37') {
    // left arrow
    console.log("Left");
    deltaPosX = deltaPosX + hw;
    document.getElementById("block" + mod(indexY + 1, 3) + "col" + mod(indexX + 2, 3)).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + "col" + mod(indexX + 2, 3)).style.left = -deltaPosX + "px";
    logPosCol(mod(indexY + 1, 3));
    target = '.block' + mod(indexY + 1, 3);
    let animation = anime({
      targets: target,
      translateX: deltaPosX,
      easing: 'spring(1, 80, 10, 0)'
    });
    indexX -= 1;
    console.log("X: " + indexX + " Y: " + indexY);
  } else if (e.keyCode == '39') {
    // right arrow
    console.log("Right");
    deltaPosX = deltaPosX - hw;
    document.getElementById("block" + mod(indexY + 1, 3) + "col" + mod(indexX + 2, 3)).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + "col" + mod(indexX + 2, 3)).style.left = -deltaPosX + hw + "px";
    target = '.block' + mod(indexY + 1, 3);
    let animation = anime({
      targets: target,
      translateX: deltaPosX,
      easing: 'spring(1, 80, 10, 0)'
    });
    logPosCol(mod(indexY + 1, 3));
    indexX += 1;
    $("#row" + mod(indexX + 2, 3)).children(":first").html("" + indexX);
    console.log("X: " + indexX + " Y: " + indexY);
  }
  // document.getElementById('top-half').style.backgroundColor = colors[mod(indexY, colors.length)]
  // document.getElementById('bottom-left1').style.backgroundColor = colors[mod((indexY + 1), colors.length)]
  // document.getElementById('bottom-right1').style.backgroundColor = colors[mod((indexY + 2), colors.length)]
  // document.getElementById('bottom-left2').style.backgroundColor = colors[mod((indexY + 3), colors.length)]
  // document.getElementById('bottom-right3').style.backgroundColor = colors[mod((indexY + 4), colors.length)]
  console.log(`${e.code}`);
  update();
}
