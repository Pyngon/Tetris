/**
 * Call this function to generate a piece randomly.
 */
function generateRandomPiece(){
  var type = Math.floor(Math.random() * pieceProperties.length);
  return new Piece(type);
}

function generateNewPieceWith(color, shape){
  var piece = new Piece();
  piece.color = color;
  piece.shape = shape;
  return piece;
}

/**
 * Represent a Tetris piece, call this function to generate a new piece.
 * @param {int} type - which type of piece you want to generate.
 * values:
 * 0 - l
 * 1 - J
 * 2 - L
 * 3 - O
 * 4 - S
 * 5 - T
 * 6 - Z
 * @constructor
 */
function Piece(type){
  if(type != undefined){
    this.color = pieceProperties[type].color;
    this.shape = [];
    for(var i =0;i<pieceProperties[type].shape.length;i++){
      this.shape.push(pieceProperties[type].shape[i].slice());
    }
  }
  // this.shape = piece_properties[type].shape;
}

var pieceProperties = [
  {color: "#FF0000", shape: [[1,1,1,1]]},
  {color: "#FF00FF", shape: [[1,1,1], [1,0,0], [0,0,0]]},
  {color: "#FFFF00", shape: [[1,1,1], [0,0,1], [0,0,0]]},
  {color: "#0000FF", shape: [[1,1], [1,1]]},
  {color: "#00FF00", shape: [[1,1,0], [0,1,1]]},
  {color: "#00FFFF", shape: [[1,1,1], [0,1,0], [0,0,0]]},
  {color: "#BDBDBD", shape: [[0,1,1], [1,1,0]]}
];
