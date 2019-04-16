const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 45;
const X_OFFSET = 290;
const Y_OFFSET = 70;
// const LIGHTBLUE = [{x: 3, y:0},
//                   {x: 4, y:0},
//                   {x: 5, y:0},
//                   {x: 6, y:0}]
const LIGHTBLUE = [{x: 3, y:5},
                  {x: 4, y:5},
                  {x: 5, y:5},
                  {x: 6, y:5}]
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
        activePiece = {color: "lightblue", pieces: LIGHTBLUE, orientation: "horizontal"};
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

      }else if(e.keyCode==39){ //right

      }else if(e.keyCode==40){ //down

      }else if(e.keyCode==38){ //up

      }else if(e.keyCode==90){ //z
        rotateCounterClockwise();
      }else if(e.keyCode==88){ //x
        rotateClockwise();
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

    function rotateClockwise(){

    }

    function rotateCounterClockwise(){

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
