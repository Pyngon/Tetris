var UNIT_SIZE = 20;
var GAME_WIDTH = 10;
var GAME_HEIGHT = 20;

/* FPS related */
// var txtFPS, framesThisSecond = 0, lastFPSUpdate = 0, fps = 0;

/* User input */
var keyDownTimer, keyCodeDown = 0;

/* HTML element */
var canvas;
var canvasCtx;
var canvasPanel;
var canvasPanelCtx;
var canvasNextPiece;
var canvasNextPieceCtx;
var txtScore;
var txtHighestScore;
var btnStart;

var gameObj;
var highestScore = 0;

/* animation */
var lastUpdateTimeStamp;
var timeStep;  // Maximum moving speed is 20units/s.
var delta = 0;
var maxDelta = timeStep*2;
var animFrameID;

function onPageLoad(){
  canvas = document.getElementById('canvasTetris');
  canvasCtx = canvas.getContext("2d");
  canvasCtx.strokeStyle = "#000000";

  canvasPanel = document.getElementById('canvasTetrisPanel');
  canvasPanelCtx = canvasPanel.getContext("2d");
  canvasPanelCtx.strokeStyle = "#000000";

  canvasNextPiece = document.getElementById('canvasNextPiece');
  canvasNextPieceCtx = canvasNextPiece.getContext("2d");
  canvasNextPieceCtx.strokeStyle = "#000000";

  // txtFPS = document.getElementById('txtFPS');

  txtScore = document.getElementById('txtScore');
  txtHighestScore = document.getElementById('txtHighestScore');

  btnStart = document.getElementById('btnStart');

  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keyup", onKeyUp, true);
}

function onKeyDown(event){
  if(gameObj != null && gameObj.gameState == Game.StateEnum.RUNNING){
    if(keyDownTimer != null){
      if(keyCodeDown == event.which){
        return;
      }
      window.clearInterval(keyDownTimer);
      keyDownTimer = null;
    }

    switch(event.which){
      case 37: //left
        gameObj.moveLeft();
        keyDownTimer = window.setInterval(function(){
          gameObj.moveLeft();
        }, 80);
        break;
      case 38: //up
        gameObj.rotate();
        break;
      case 39: // right
        gameObj.moveRight();
        keyDownTimer = window.setInterval(function(){
          gameObj.moveRight();
        }, 80);
        break;
      case 40: // down
        // TODO Not smooth enough
        gameObj.moveDown();
        keyDownTimer = window.setInterval(function(){
          gameObj.moveDown();
        }, 80);
        break;
      case 32: // spacebar
        gameObj.hardDrop();
        break;
      default:
        return;
    }
    keyCodeDown = event.which;
    event.stopPropagation();
  }
}

function onKeyUp(event){
  if(event.which == 32){
    event.stopPropagation();
  }

  if(keyDownTimer != null
      && keyCodeDown == event.which){
    window.clearInterval(keyDownTimer);
    keyDownTimer = null;
    keyCodeDown = 0;
  }
}

function onBtnStartClick(element){
  console.log("onBtnStartClick");

  /* Prevent spacebar to pause the game */
  element.blur();

  if(gameObj == null || gameObj.gameState == Game.StateEnum.END){
    gameObj = new Game(GAME_WIDTH, GAME_HEIGHT);
  }

  if(gameObj.gameState == Game.StateEnum.READY){
    // TODO: This function may not be supported in some browsers. May need to change to setInterval.
    animFrameID = requestAnimationFrame(function(timeStamp){
      gameObj.gameState = Game.StateEnum.RUNNING;

      lastUpdateTimeStamp = timeStamp;
      delta = 0;
      timeStep = 1000/gameObj.speed;
      maxDelta = timeStep*2;

      animFrameID = requestAnimationFrame(mainLoop);
    });
    element.innerHTML = "Pause";
  } else if(gameObj.gameState == Game.StateEnum.RUNNING){
    gameObj.gameState = Game.StateEnum.PAUSE;
    cancelAnimationFrame(animFrameID);
    element.innerHTML = "Resume";
  } else if(gameObj.gameState == Game.StateEnum.PAUSE){
    animFrameID = requestAnimationFrame(function(timeStamp){
      gameObj.gameState = Game.StateEnum.RUNNING;
      lastUpdateTimeStamp = timeStamp;
      animFrameID = requestAnimationFrame(mainLoop);
    });
    element.innerHTML = "Pause";
  }
}

function onBtnResetClick(){
  if(gameObj != null){
    gameObj = null;
    cancelAnimationFrame(animFrameID);

    // TODO: try to parameterized the rectangle size.
    canvasNextPieceCtx.clearRect(0,0, 120, 80);
    canvasCtx.clearRect(0, 0, 200, 400);

    if(btnStart){
      btnStart.innerHTML = "Start";
    }
  }
}

function mainLoop(timeStamp){
  if(gameObj.gameState != Game.StateEnum.RUNNING){
    if(gameObj.gameState == Game.StateEnum.END){
      canvasCtx.fillStyle = "black";
      canvasCtx.textAlign = "center";
      canvasCtx.fillText("Game Over", canvas.width/2, canvas.height/2);

      if(gameObj.score > highestScore){
        highestScore = gameObj.score;
        txtHighestScore.innerHTML = gameObj.score;
      }

      if(btnStart){
        btnStart.innerHTML = "Start";
      }
    }
    return;
  }

  delta += (timeStamp - lastUpdateTimeStamp);
  if(delta > maxDelta){
    delta = maxDelta;
  }
  lastUpdateTimeStamp = timeStamp;
  while(delta >= timeStep){
    update();
    delta -= timeStep;
  }

  draw();

  // calculateFPS(timeStamp);
  // txtFPS.textContent = Math.round(fps);

  animFrameID = requestAnimationFrame(mainLoop);
}

// function calculateFPS(timeStamp){
//   if (timeStamp > lastFPSUpdate + 1000) {
//        fps = 0.25 * framesThisSecond + 0.75 * fps;
//        lastFPSUpdate = timeStamp;
//        framesThisSecond = 0;
//    }
//    framesThisSecond++;
// }

function update(){
  if(!gameObj.moveDown()){
    gameObj.next();
  }
}

function draw(){
  // TODO: try to parameterized the rectangle size.
  canvasNextPieceCtx.clearRect(0,0, 120, 80);
  canvasCtx.clearRect(0, 0, 200, 400);

  if(gameObj.nextPiece != null){
    // TODO: use better way to decide the position
    drawPiece(canvasNextPieceCtx, gameObj.nextPiece, {x:1, y:1}, 4);
  }

  if(gameObj.currentPiece != null){
    drawPiece(canvasCtx, gameObj.currentPiece, gameObj.currentPiecePos, gameObj.gameHeight);
  }

  if(gameObj.isGamePanelUpdated){
    canvasPanelCtx.clearRect(0, 0, 200, 400);
    gameObj.isGamePanelUpdated = false;
    var x, y, drawX, drawY;
    for(y = 0;y < gameObj.gameHeight;y++){
      for(x = 0;x < gameObj.gameWidth;x++){
        if(gameObj.gamePanel[y][x] != null){
          drawX = x * UNIT_SIZE;
          drawY = (gameObj.gameHeight - 1 - y) * UNIT_SIZE;
          canvasPanelCtx.fillStyle = gameObj.gamePanel[y][x];
          canvasPanelCtx.fillRect(drawX, drawY, UNIT_SIZE, UNIT_SIZE);
          canvasPanelCtx.strokeRect(drawX, drawY, UNIT_SIZE, UNIT_SIZE);
        }
      }
    }
  }

  txtScore.innerHTML = gameObj.score;
}

/**
 * Draw a game piece in a particular position.
 * @param context - the canvas context to be drawn on.
 * @param piece - the game piece to be drawn.
 * @param pos - the top left logical position(10x20 panel) to draw the game piece.
 */
function drawPiece(context, piece, pos, maxHeight){
  var drawX, drawY;
  context.fillStyle = piece.color;
  for(var y = 0;y < piece.shape.length;y++){
    for(var x = 0;x < piece.shape[y].length;x++){
      if(piece.shape[y][x] != 0){
        // console.log("p1.shape[" + i + "][" + j + "]=" + piece.shape[i][j]);
        drawX = (x + pos.x)*UNIT_SIZE;
        drawY = (maxHeight - 1 - (y + pos.y))*UNIT_SIZE;
        context.fillRect(drawX, drawY, UNIT_SIZE, UNIT_SIZE);
        context.strokeRect(drawX, drawY, UNIT_SIZE, UNIT_SIZE);
      }
    }
  }
}
