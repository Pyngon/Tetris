Game.StateEnum = {
  READY: 0,
  RUNNING: 1,
  PAUSE: 2,
  END: 3
};

/**
 * Represent the game state of a tetris game. Game panel origin at bottom left.
 */
function Game(gameWidth, gameHeight){
  this.gameWidth = gameWidth;
  this.gameHeight = gameHeight;

  this.currentPiece = generateRandomPiece();
  this.currentPiecePos = {
    x: Math.floor(gameWidth/2 - this.currentPiece.shape[0].length/2),
    y: gameHeight - 1};
  this.nextPiece = generateRandomPiece();
  this.speed = 1; // Unit/Second
  this.maxSpeed = 15; // Unit/Second

  /* Use a simple scoring system, (3 ^ (lines-1)) */
  this.score = 0;

  this.gamePanel = new Array(gameHeight + 2); // Add 2 rows for piece generation
  for(var i=0;i<this.gamePanel.length;i++){
    this.gamePanel[i] = new Array(gameWidth);
  }
  this.isGamePanelUpdated = true;

  // for(var y=0;y<this.gamePanel.length;y++){
  //   for(var x=0;x<this.gamePanel[y].length;x++){
  //     this.gamePanel[y][x] = null;
  //   }
  // }

  this.gameState = Game.StateEnum.READY;
}

Game.prototype.next = function(){
  console.log("next");
  /* Fill in game panel */
  var x, y, panelX, panelY, completed, earnedScore = 0;
  for(y=this.currentPiece.shape.length - 1;y>=0;y--){
    completed = true;
    panelY = this.currentPiecePos.y + y;
    if(panelY < 0){
      continue;
    }

    for(x=0;x<this.currentPiece.shape[y].length;x++){
      if(this.currentPiece.shape[y][x] != 0){
        panelX = this.currentPiecePos.x + x;
        this.gamePanel[panelY][panelX] = this.currentPiece.color;
      }
    }

    /* check for completed line */
    for(x=0;x<this.gameWidth;x++){
      if(this.gamePanel[panelY][x] == null){
        completed = false;
        break;
      }
    }

    if(completed == true){
      console.log("completed");
      this.gamePanel.splice(panelY, 1);
      this.gamePanel.push(new Array(this.gameWidth));
      earnedScore = earnedScore == 0 ? 1 : earnedScore * 3;
    }
  }

  this.isGamePanelUpdated = true;

  this.score += earnedScore;

  if(this.isGameOver()){
    this.gameState = Game.StateEnum.END;
    return;
  }

  this.currentPiece = this.nextPiece;
  this.currentPiecePos = {
    x: Math.floor(this.gameWidth/2 - this.currentPiece.shape[0].length/2),
    y: this.gameHeight - 1};
  this.nextPiece = generateRandomPiece();
}

Game.prototype.moveDown = function(){
  return this.move(0,-1);
}

Game.prototype.moveLeft = function(){
  return this.move(-1,0);
}

Game.prototype.moveRight = function(){
  return this.move(1, 0);
}

Game.prototype.move = function(xOffset, yOffset){
  var newPos = {
    x: this.currentPiecePos.x + xOffset,
    y: this.currentPiecePos.y + yOffset
  };
  if(this.checkBoundaries(this.currentPiece, newPos)){
    this.currentPiecePos = newPos;
    return true;
  }

  return false;
}

Game.prototype.hardDrop = function(){
  // TODO: Is there a O(1) way to do the hard drop?
  for(var i=this.currentPiecePos.y - 1;i <= this.gameHeight;i--){
    if(!this.checkBoundaries(this.currentPiece, {x: this.currentPiecePos.x, y: i})){
      this.currentPiecePos.y = i + 1;
      this.next();
      break;
    }
  }
}

Game.prototype.rotate = function(){
  var rotatedPiece = this.clockwiseRotate(this.currentPiece);
  var rotatedPos = this.getPosAfterRotation(rotatedPiece, this.currentPiecePos);

  if(this.checkBoundaries(rotatedPiece, rotatedPos)){
    this.currentPiecePos = rotatedPos;
    this.currentPiece = rotatedPiece;
    return true;
  }
  return false;
}

/**
 * This function rotates the input piece. It will place the rotated piece in
 * a new array and will not change the original piece.
 * @param piece - the piece to be rotated.
 * @return The rotated piece.
 */
Game.prototype.clockwiseRotate = function(piece){
  var rotatedShape = [];
  var rotatedRow;

  for(var x=piece.shape[0].length - 1;x>=0;x--){
    rotatedRow = [];
    for(var y=0;y < piece.shape.length;y++){
      rotatedRow.push(piece.shape[y][x]);
    }
    rotatedShape.push(rotatedRow);
  }

  return generateNewPieceWith(piece.color, rotatedShape);
}

/**
 * The new position of x after rotation is x2 = x1 + (row - column)/2.
 * The new position of y after rotation is y2 = y1 + (column - row)/2.
 * @param rotatedPiece
 * @param oPos
 * @return The new postion after rotation.
 */
Game.prototype.getPosAfterRotation = function(rotatedPiece, oPos){
  var xOffset = (rotatedPiece.shape.length - rotatedPiece.shape[0].length)/2;
  var yOffset = (rotatedPiece.shape[0].length - rotatedPiece.shape.length)/2;
  xOffset = xOffset > 0 ? Math.floor(xOffset) : Math.ceil(xOffset);
  yOffset = yOffset > 0 ? Math.ceil(yOffset) : Math.floor(yOffset);  // use ceil because of bottom left origin
  return newPos = {
    x: oPos.x + xOffset,
    y: oPos.y + yOffset
  };
}

/**
 * Check whether the new position is valid.
 * @param piece - the game piece to be validated
 * @param piecePos - the new position of the game piece
 * @return true if valid, false otherwise
 */
Game.prototype.checkBoundaries = function(piece, piecePos){
  /* First set the boundary to the limit, let the loop below adjust */
  var topBound = 0;
  var bottomBound = piece.shape.length - 1;
  var leftBound = piece.shape[0].length - 1;
  var rightBound = 0;
  var x,y;
  /* check for empty column or row */
  for(y=0;y < piece.shape.length;y++){
    for(x=0;x < piece.shape[y].length;x++){
      if(piece.shape[y][x] != 0){
        if(x < leftBound){
          leftBound = x;
        }
        if(x > rightBound){
          rightBound = x;
        }
        if(y > topBound){
          topBound = y;
        }
        if(y < bottomBound){
          bottomBound = y;
        }
      }
    }
  }

  /* Check left boundary */
  if(piecePos.x + leftBound < 0){
    return false;
  }

  /* Check right boundary */
  if(piecePos.x + rightBound >= this.gameWidth){
    return false;
  }

  /* Check bottom boundary */
  if(piecePos.y + bottomBound < 0){
    return false;
  }

  /* Check collision with existing pieces in game panel */
  var panelX, panelY;
  for(y=0;y < piece.shape.length;y++){
    for(x=0;x < piece.shape[y].length;x++){
      if(piece.shape[y][x] != 0){
        panelX = piecePos.x + x;
        panelY = piecePos.y + y;
        if(panelX >= 0 && panelX < this.gameWidth
            && panelY >= 0 && panelY < this.gameHeight
            && this.gamePanel[panelY][panelX]){
          return false;
        }
      }
    }
  }

  return true;
}

Game.prototype.isGameOver = function(){
  var x;
  for(x=0;x<this.gameWidth;x++){
    if(this.gamePanel[this.gameHeight][x] != null){
      return true;
    }
  }
  return false;
}
