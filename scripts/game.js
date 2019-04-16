const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 45;
const X_OFFSET = 290;
const Y_OFFSET = 70;
const LIGHTBLUE = [{x: 3, y:0}, //straight
                  {x: 4, y:0},
                  {x: 5, y:0},
                  {x: 6, y:0}];
const PINK = [{x: 4, y:0}, //straight
              {x: 5, y:0},
              {x: 4, y: 1},
              {x: 5, y: 1}];

const GREEN = [{x: 3, y: 1},//S
                {x: 4, y: 1},
                {x: 4, y:0},
                {x: 5, y:0}];

const RED = [{x: 3, y:0}, //Z
              {x: 4, y:0},
              {x: 4, y: 1},
              {x: 5, y: 1}];

const PURPLE = [{x: 3, y:1}, //T
              {x: 4, y:1},
              {x: 5, y: 1},
              {x: 4, y: 0}];

const ORANGE = [{x: 3, y:1}, //L
              {x: 4, y:1},
              {x: 5, y: 1},
              {x: 5, y: 0}];

const BLUE = [{x: 3, y:1}, //J
              {x: 4, y:1},
              {x: 5, y: 1},
              {x: 3, y: 0}];
let canvas = document.getElementById("id-canvas");
let context = canvas.getContext("2d");

MyGame.main = (function (systems, renderer, assets, graphics) {
    'use strict';
    let cells;
    let activePiece = {};
    let lastTimeStamp = performance.now();

    let particlesFire = systems.ParticleSystem({
            center: { x: 300, y: 300 },
            size: { mean: 10, stdev: 4 },
            speed: { mean: 50, stdev: 25 },
            lifetime: { mean: 4, stdev: 1 }
        },
        graphics);
    let particlesSmoke = systems.ParticleSystem({
            center: { x: 300, y: 300 },
            size: { mean: 10, stdev: 4 },
            speed: { mean: 50, stdev: 25 },
            lifetime: { mean: 4, stdev: 1 }
        },
        graphics);

    let renderFire = renderer.ParticleSystem(particlesFire, graphics, assets['fire']);
    let renderSmoke = renderer.ParticleSystem(particlesSmoke, graphics, assets['smoke']);

    function update(elapsedTime) {
        cells = initializeCells()
        addPiecesToBoard();
        drawBoard();
        // particlesSmoke.update(elapsedTime);
        // particlesFire.update(elapsedTime);
    }

    function render() {
        graphics.clear(assets["background"]);
        drawBoard();
        renderSmoke.render();
        renderFire.render();

    }

    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);

        update(elapsedTime);
        lastTimeStamp = time;

        render();

        requestAnimationFrame(gameLoop);
    };

    function initialize() {
        console.log('game initializing...');
        // activePiece = {color: "lightblue", pieces: LIGHTBLUE, orientation: "horizontal"};
        activePiece = {color: "pink", pieces: PINK};
        // activePiece = {color: "green", pieces: GREEN, orientation: "horizontal"};
        // activePiece = {color: "red", pieces: RED, orientation: "horizontal"};
        // activePiece = {color: "purple", pieces: PURPLE, orientation: "up"};
        // activePiece = {color: "blue", pieces: BLUE, orientation: "up"};
        // activePiece = {color: "orange", pieces: ORANGE, orientation: "up"};
        requestAnimationFrame(gameLoop);
    }

    function addPiecesToBoard(){
      for(let i = 0; i < 4; i++){
        cells[getKey(activePiece.pieces[i].x ,activePiece.pieces[i].y)] = activePiece.color;
      }
      //add inactive pieces
    }

    function drawBoard() {
      for(let x = 0; x < GRID_WIDTH; x++){
        for(let y = 0; y< GRID_HEIGHT; y++){
          //need logic here to determine if piece occupies cell. if so, put that piece color. otherwise, put white piece
          graphics.drawTexture(assets[cells[getKey(x,y)]], {x:x*CELL_SIZE+X_OFFSET, y:y*CELL_SIZE+Y_OFFSET}, 0, {x:CELL_SIZE, y:CELL_SIZE});
        }
      }
    }

    window.onkeyup = function(e) {
      // console.log(e.key);
      console.log(e.keyCode);
       if(e.keyCode==37){ //left
         moveLeft();
      }else if(e.keyCode==39){ //right
        moveRight();
      }else if(e.keyCode==40){ //down

      }else if(e.keyCode==38){ //up

      }else if(e.keyCode==90){ //z
        rotate("counter");
      }else if(e.keyCode==88){ //x
        rotate("clockwise");
      }
  }

  function moveLeft(){
    let copy = Object.assign({}, activePiece);
    for(let i = 0; i<4; i++){
      if(activePiece.pieces[i].x == 0){
        return;
      }
    }
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].x -= 1;
    }
  }

  function moveRight(){
    let copy = Object.assign({}, activePiece);
    for(let i = 0; i<4; i++){
      if(activePiece.pieces[i].x == GRID_WIDTH-1){
        return;
      }
    }
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].x += 1;
    }
  }

    function initializeCells(){
      let tempCells = {};
      for(let x = 0; x < GRID_WIDTH; x++){
        for(let y = 0; y< GRID_HEIGHT; y++){
          tempCells[getKey(x,y)]="white";
        }
      }
      return tempCells;
    }

    function rotate(direction){
      if(activePiece.color=="pink"){ //square
        return; //no rotaion
      }else if(activePiece.color=="lightblue"){ //straight
        rotateStraight(); //both rotations same
      }else if(activePiece.color == "green"){//S
        rotateS(); //both rotation same
      }else if(activePiece.color == "red"){//Z
        rotateZ(); //both rotation same
      } else{ //must be T, J, or L
        if(direction=="clockwise"){
          rotateClockwise();
        }else if(direction=="counter"){
          rotateCounterClockwise();
        }
      }
    }

    function rotateClockwise(){
      if(activePiece.orientation=="up"){
        right();
      }else if(activePiece.orientation=="down"){
        left();
      }else if(activePiece.orientation=="left"){
        up();
      }else if(activePiece.orientation=="right"){
        down();
      }
    }

    function rotateCounterClockwise(){
      if(activePiece.orientation=="up"){
        left();
      }else if(activePiece.orientation=="down"){
        right();
      }else if(activePiece.orientation=="left"){
        down();
      }else if(activePiece.orientation=="right"){
        up();
      }
    }

    function rotateStraight(){
      if(activePiece.orientation=="horizontal"){
        activePiece.orientation = "vertical";
        let copy = Object.assign({}, activePiece.pieces[1]);
        activePiece.pieces[0] = { x: copy.x, y: copy.y - 2};
        activePiece.pieces[1] = { x: copy.x, y: copy.y - 1};
        activePiece.pieces[2] = copy;
        activePiece.pieces[3] = { x: copy.x, y: copy.y + 1};
      }else if(activePiece.orientation=="vertical"){
        activePiece.orientation = "horizontal";
        let copy = Object.assign({}, activePiece.pieces[2]);
        activePiece.pieces[0] = { x: copy.x-1, y: copy.y};
        activePiece.pieces[1] = copy;
        activePiece.pieces[2] = { x: copy.x+1, y: copy.y};
        activePiece.pieces[3] = { x: copy.x+2, y: copy.y};
      }
    }

    function rotateStraight(){
      if(activePiece.orientation=="horizontal"){
        activePiece.orientation = "vertical";
        let copy = Object.assign({}, activePiece.pieces[1]);
        activePiece.pieces[0] = { x: copy.x, y: copy.y - 2};
        activePiece.pieces[1] = { x: copy.x, y: copy.y - 1};
        activePiece.pieces[2] = copy;
        activePiece.pieces[3] = { x: copy.x, y: copy.y + 1};
      }else if(activePiece.orientation=="vertical"){
        activePiece.orientation = "horizontal";
        let copy = Object.assign({}, activePiece.pieces[2]);
        activePiece.pieces[0] = { x: copy.x-1, y: copy.y};
        activePiece.pieces[1] = copy;
        activePiece.pieces[2] = { x: copy.x+1, y: copy.y};
        activePiece.pieces[3] = { x: copy.x+2, y: copy.y};
      }
    }

    function rotateS(){
      if(activePiece.orientation=="horizontal"){
        activePiece.orientation = "vertical";
        let copy = Object.assign({}, activePiece.pieces[1]);
        activePiece.pieces[0] = { x: copy.x, y: copy.y - 1};
        activePiece.pieces[2] = { x: copy.x+1, y: copy.y};
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y+1};
      }else if(activePiece.orientation=="vertical"){
        activePiece.orientation = "horizontal";
        let copy = Object.assign({}, activePiece.pieces[1]);
        activePiece.pieces[0] = { x: copy.x-1, y: copy.y};
        activePiece.pieces[2] = { x: copy.x, y: copy.y-1};
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y-1};
      }
    }

    function rotateZ(){
      if(activePiece.orientation=="horizontal"){
        activePiece.orientation = "vertical";
        let copy = Object.assign({}, activePiece.pieces[2]);
        activePiece.pieces[0] = { x: copy.x+1, y: copy.y - 1};
        activePiece.pieces[1] = { x: copy.x+1, y: copy.y};
        activePiece.pieces[3] = { x: copy.x, y: copy.y+1};
      }else if(activePiece.orientation=="vertical"){
        activePiece.orientation = "horizontal";
        let copy = Object.assign({}, activePiece.pieces[2]);
        activePiece.pieces[0] = { x: copy.x-1, y: copy.y-1};
        activePiece.pieces[1] = { x: copy.x, y: copy.y-1};
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y};
      }
    }

    function up(){
      activePiece.orientation = "up";
      let copy = Object.assign({}, activePiece.pieces[1]);
      activePiece.pieces[0] = { x: copy.x-1, y: copy.y};
      activePiece.pieces[2] = { x: copy.x+1, y: copy.y};
      if(activePiece.color=="purple"){
        activePiece.pieces[3] = { x: copy.x, y: copy.y-1};
      }else if(activePiece.color=="blue"){
        activePiece.pieces[3] = { x: copy.x-1, y: copy.y-1};
      }else if(activePiece.color=="orange"){
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y-1};
      }
    }

    function down(){
      activePiece.orientation = "down";
      let copy = Object.assign({}, activePiece.pieces[1]);
      activePiece.pieces[0] = { x: copy.x-1, y: copy.y};
      activePiece.pieces[2] = { x: copy.x+1, y: copy.y};
      if(activePiece.color=="purple"){
        activePiece.pieces[3] = { x: copy.x, y: copy.y+1};
      }else if(activePiece.color=="blue"){
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y+1};
      }else if(activePiece.color=="orange"){
        activePiece.pieces[3] = { x: copy.x-1, y: copy.y+1};
      }
    }

    function left(){
      activePiece.orientation = "left";
      let copy = Object.assign({}, activePiece.pieces[1]);
      activePiece.pieces[0] = { x: copy.x, y: copy.y-1};
      activePiece.pieces[2] = { x: copy.x, y: copy.y+1};
      if(activePiece.color=="purple"){
        activePiece.pieces[3] = { x: copy.x-1, y: copy.y};
      }else if(activePiece.color=="blue"){
        activePiece.pieces[3] = { x: copy.x-1, y: copy.y+1};
      }else if(activePiece.color=="orange"){
        activePiece.pieces[3] = { x: copy.x-1, y: copy.y-1};
      }
    }

    function right(){
      activePiece.orientation = "right";
      let copy = Object.assign({}, activePiece.pieces[1]);
      activePiece.pieces[0] = { x: copy.x, y: copy.y-1};
      activePiece.pieces[2] = { x: copy.x, y: copy.y+1};
      if(activePiece.color=="purple"){
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y};
      }else if(activePiece.color=="blue"){
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y-1};
      }else if(activePiece.color=="orange"){
        activePiece.pieces[3] = { x: copy.x+1, y: copy.y+1};
      }
    }

    return {
        initialize: initialize
    };

}(MyGame.systems, MyGame.render, MyGame.assets, MyGame.graphics));

function startGame(){
  MyGame.main.initialize();
  let audio = new Audio(MyGame.assets["music"].src);
  audio.play();
}

function highScores(){
  // highs = highs.sort(sortNumber);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  //change rect size when
  context.fillStyle = "grey";
  context.fillRect(10, 70, 200, 300);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("high scores:", 20, 100);
  context.fillText("1. 123123123", 40, 150);
  context.fillText("1. 123123123", 40, 200);
  context.fillText("1. 123123123", 40, 250);
  context.fillText("1. 123123123", 40, 300);
  context.fillText("1. 123123123", 40, 350);
  // context.fillText("1. " + highs[0], 40, 250);
  // context.fillText("2. " + highs[1], 40, 300);
  // context.fillText("3. " + highs[2], 40, 350);
  // context.fillText("4. " + highs[3], 40, 400);
  // context.fillText("5. " + highs[4], 40, 450);
}

function controls(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  context.fillStyle = "grey";
  context.fillRect(10, 70, 420, 150);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("controls:", 20, 100);
  //to be done when I am ready for keyCode stuff
  // context.fillText("by alan henderson", 40, 150);
  // context.fillText("all assets from opengameart.org", 40, 200);
}

function credits(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  context.fillStyle = "grey";
  context.fillRect(10, 70, 420, 150);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("credits:", 20, 100);
  context.fillText("by alan henderson", 40, 150);
  context.fillText("all assets from opengameart.org", 40, 200);
}

function getKey(x,y){
  return x.toString() + y.toString();
}
