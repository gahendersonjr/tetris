const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 45;
const X_OFFSET = 200;
const Y_OFFSET = 70;
let highs = [0,0,0,0,0];
if(localStorage.getItem("tetris.highs")){
  highs = localStorage.getItem("tetris.highs").split(',');
}
let canvas = document.getElementById("id-canvas");
let context = canvas.getContext("2d");
let keyMappings = {
  "left": {key: 37, value: "ArrowLeft", name: "move left"},
  "right": {key: 39, value: "ArrowRight", name: "move right"},
  "soft": {key: 40, value: "ArrowDown", name: "soft drop"},
  "hard": {key: 38, value: "ArrowUp", name: "hard drop"},
  "clockwise": {key: 33, value: "PageUp", name: "rotate clockwise"},
  "counter": {key: 36, value: "Home", name: "rotate counter-clockwise"}
}
for(let key in keyMappings){
  if(localStorage.getItem("tetris."+ key)){
    keyMappings[key].value = localStorage.getItem("tetris."+ key+"Name");
    keyMappings[key].key = localStorage.getItem("tetris."+ key);
  }
}
let commandToChange = "";
let started = false;

MyGame.main = (function (systems, renderer, assets, graphics) {
    'use strict';
    let cells = initializeCells();
    let nextPiece = getRandomPiece();
    let activePiece = getRandomPiece();
    let landed = false;
    let lastTimeStamp = performance.now();
    let frameTime = 0;
    let frameSpeed = 1000;
    let chainReaction = 100;
    let cleared = [];
    let linesCleared = 0;
    let score = 0;
    let level = 0;
    let gameOver = false;

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
        frameTime += elapsedTime;
        if (frameTime>frameSpeed) {
          frameTime = 0;
          if(cleared.length>0){
            frameSpeed = 100;
            cleared.sort(sortNumber);
            dropRow(cleared.pop());
          }else{
            if(level<100){
              frameSpeed = 1000 - level*100;
            }
            moveDown();
          }
        }
        if(landed){
          for(let i = 0; i<4;i++){
            cells[getKey(activePiece.pieces[i].x,activePiece.pieces[i].y)] = activePiece.color;
          }
          activePiece = nextPiece;
          nextPiece = getRandomPiece();
          for(let i = 0;i<4;i++){
            if(cells[getKey(activePiece.pieces[i].x, activePiece.pieces[i].y)]!="white"){
              gameOver = true;
            }
          }
          checkCompleteRow();
          landed=false;
        }
        // particlesSmoke.update(elapsedTime);
        // particlesFire.update(elapsedTime);
    }

    function render() {
        graphics.clear(assets["background"]);
        drawNextPiece();
        drawBoard();
        addPiecesToBoard();
        renderSmoke.render();
        renderFire.render();

    }

    function gameLoop(time) {
        if(!gameOver && started){
          let elapsedTime = (time - lastTimeStamp);
          update(elapsedTime);
          lastTimeStamp = time;
          render();
          requestAnimationFrame(gameLoop);
        }else{
          gameOverScreen(score);
        }
    };

    function initialize() {
        console.log('game initializing...');
        requestAnimationFrame(gameLoop);
    }

    function checkCompleteRow(){
      for(let y = GRID_HEIGHT - 1; y>=0; y--){
        let rowCleared = true;
        for(let x = 0; x < GRID_WIDTH; x++){
          if(cells[getKey(x,y)]=="white"){
            rowCleared=false;
          }
        }
        if(rowCleared){
          clearRow(y);
          cleared.push(y);
        }
      }
      if(cleared.length ==1){
        score += 40 * (level+1);
      }else if(cleared.length ==2){
        score += 100 * (level+1);
      } else if(cleared.length ==3){
        score += 300 * (level+1);
      } else if(cleared.length ==4){
        score += 1200 * (level+1);
      }
      if(level<100){
        frameSpeed = 1000 - level*100;
      }
      linesCleared+=cleared.length;
      level = Math.floor(linesCleared/10);
      setScoreText(level, score, linesCleared);
    }

    function clearRow(y){
      for(let x = 0; x <GRID_WIDTH; x++){
        cells[getKey(x,y)]="white";
      }
      let audio = new Audio(MyGame.assets["lineCleared"].src);
      audio.play();
    }

    function dropRow(clearY){
      for(let y = clearY; y>0;y--){
        for(let x = 0; x<GRID_WIDTH; x++){
          if (y>0){
            cells[getKey(x,y)] = cells[getKey(x,y-1)];
          }
          else{
            cells[getKey(x,y)] = "white";
          }
        }
      }
    }

    function addPiecesToBoard(){
      for(let i = 0; i < 4; i++){
        graphics.drawTexture(assets[activePiece.color], {x:activePiece.pieces[i].x*CELL_SIZE+X_OFFSET, y:activePiece.pieces[i].y*CELL_SIZE+Y_OFFSET}, 0, {x:CELL_SIZE, y:CELL_SIZE});
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

    function drawNextPiece(){
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(MyGame.assets["background"], 0, 0);
      context.fillStyle = "grey";
      context.fillRect(660, 270, 300, 150);
      context.fillStyle = "white";
      context.font = "20px Courier New";
      context.fillText("next piece:", 680, 290);
      for(let i = 0; i<4;i++){
        graphics.drawTexture(assets[nextPiece.color], {x:nextPiece.pieces[i].x*CELL_SIZE+620, y:nextPiece.pieces[i].y*CELL_SIZE+330}, 0, {x:CELL_SIZE, y:CELL_SIZE});
      }

    }

    window.onkeyup = function(e) {
      // console.log(e.key);
      // console.log(e.keyCode);
      if(commandToChange.length > 0){
        changeMapping(e.keyCode, e.key);
      }else if(!started){
        return;
      }else if(e.keyCode==keyMappings["left"].key){ //left
         moveLeft();
      }else if(e.keyCode==keyMappings["right"].key){ //right
        moveRight();
      }else if(e.keyCode==keyMappings["soft"].key){ //down
        moveDown();
      }else if(e.keyCode==keyMappings["hard"].key){ //up
        hardDrop();
      }else if(e.keyCode==keyMappings["counter"].key){ //z
        rotate("counter");
      }else if(e.keyCode==keyMappings["clockwise"].key){ //x
        rotate("clockwise");
      }
  }

  function hardDrop(){
    while(moveDown()){}
  }

  function moveLeft(){
    for(let i = 0; i<4; i++){
      if(activePiece.pieces[i].x <0 || (cells[getKey(activePiece.pieces[i].x-1, activePiece.pieces[i].y)]!="white" && activePiece.pieces[i].x-1 <=GRID_WIDTH-1)){
        return;
      }
    }
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].x -= 1;
    }
  }

  function moveRight(){
    for(let i = 0; i<4; i++){
      if(activePiece.pieces[i].x >= GRID_HEIGHT-1 || (cells[getKey(activePiece.pieces[i].x+1, activePiece.pieces[i].y)]!="white" && activePiece.pieces[i].x+1 >=0)){
        return;
      }
    }
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].x += 1;
    }
  }

  function moveDown(){
    for(let i = 0; i<4; i++){
      if(activePiece.pieces[i].y >= GRID_HEIGHT-1 || (cells[getKey(activePiece.pieces[i].x, activePiece.pieces[i].y+1)]!="white" && activePiece.pieces[i].y+1 >=0)){
        landed=true;
        let audio = new Audio(MyGame.assets["landed"].src);
        audio.play();
        return false;
      }
    }
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].y += 1;
    }
    return true;
  }

  function moveUp(){
    for(let i = 0; i<4; i++){
      activePiece.pieces[i].y -= 1;
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
      let piecesCopy = Object.assign([], activePiece.pieces);
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
      while(wallKick()){};

      for(let i = 0; i<4;i++){
        if(cells[getKey(activePiece.pieces[i].x,activePiece.pieces[i].y)] && cells[getKey(activePiece.pieces[i].x,activePiece.pieces[i].y)]!="white"){
          activePiece.pieces = piecesCopy;
        }
      }
    }

    function wallKick(){
      for(let i = 0; i< 4; i++){
        if(activePiece.pieces[i].x<0){
          moveRight();
          return true;
        }else if(cells[getKey(activePiece.pieces[i].x-1, activePiece.pieces[i].y)] && cells[getKey(activePiece.pieces[i].x-1, activePiece.pieces[i].y)]!="white"){
          moveRight();
          return false;
        }else if(activePiece.pieces[i].x>=GRID_WIDTH){
          moveLeft();
          return true;
        }else if(cells[getKey(activePiece.pieces[i].x+1, activePiece.pieces[i].y)] && cells[getKey(activePiece.pieces[i].x+1, activePiece.pieces[i].y)]!="white"){
          moveLeft();
          return false;
        }else if(activePiece.pieces[i].y>=GRID_HEIGHT){
          moveUp();
          return true;
        }else if(activePiece.pieces[i].y<0){
          moveDown();
          return true;
        }
      }
    return false;
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
  started = true;
  commandToChange = "";
  toggle("controlButton", "none");
  document.getElementById("startGame").style.display = "none";
  document.getElementById("highScores").style.display = "none";
  document.getElementById("control").style.display = "none";
  document.getElementById("credits").style.display = "none";
  setScoreText(1,0,0);
  MyGame.main.initialize();
  let audio = new Audio(MyGame.assets["music"].src);
  audio.play();
}

function highScores(){
  commandToChange = "";
  toggle("controlButton", "none");
  highs = highs.sort(sortScore);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  context.fillStyle = "grey";
  context.fillRect(10, 70, 200, 300);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("high scores:", 20, 100);
  context.fillText("1. " + highs[0], 40, 150);
  context.fillText("2. " + highs[1], 40, 200);
  context.fillText("3. " + highs[2], 40, 250);
  context.fillText("4. " + highs[3], 40, 300);
  context.fillText("5. " + highs[4], 40, 350);
}

function controls(){
  commandToChange = "";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  context.fillStyle = "grey";
  context.fillRect(10, 70, 475, 400);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("controls:", 20, 100);
  context.fillText(keyMappings["left"].name + ": " + keyMappings["left"].value, 40, 150);
  context.fillText(keyMappings["right"].name + ": " + keyMappings["right"].value, 40, 200);
  context.fillText(keyMappings["soft"].name + ": " + keyMappings["soft"].value, 40, 250);
  context.fillText(keyMappings["hard"].name + ": " + keyMappings["hard"].value, 40, 300);
  context.fillText(keyMappings["clockwise"].name + ": " + keyMappings["clockwise"].value, 40, 350);
  context.fillText(keyMappings["counter"].name + ": " + keyMappings["counter"].value, 40, 400);
  let container = document.getElementById("canvas-container");
  for(let key in keyMappings){
    let btn = document.createElement("button");
    btn.innerHTML = "change";
    btn.id = key;
    btn.className = "controlButton";
    btn.onclick = function(){changeMappingScreen(this.id)};
    container.appendChild(btn);
  }
}

function changeMappingScreen(control){
  toggle("controlButton", "none");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  context.fillStyle = "grey";
  context.fillRect(10, 70, 775, 50);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("click any button to map to \'" + keyMappings[control].name + "\' command", 20, 100);
  commandToChange = control;
}

function changeMapping(code, value){
  console.log(keyMappings[commandToChange]);
  keyMappings[commandToChange].key = code;
  keyMappings[commandToChange].value = value;
  console.log(keyMappings[commandToChange]);
  localStorage.setItem("tetris." + commandToChange+"Name", value);
  localStorage.setItem("tetris." + commandToChange, code);
  commandToChange = "";
  controls();
}


function credits(){
  commandToChange = "";
  toggle("controlButton", "none");
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

function gameOverScreen(score){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  console.log("gameOver");
  context.fillStyle = "grey";
  context.fillRect(10, 70, 470, 150);
  context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("game over. you scored " + score.toString(), 20, 100);
  highs.sort(sortScore);
  console.log(highs);
  if (score >= highs[4] && score!=0){
    context.fillText("you got a high score!", 40, 150);
    highs[4]=score;
  }
  highs.sort(sortScore);
  score = 0;
  context.fillText("refresh your browswer to play again", 40, 200);
  for(let i in highs){
    highs[i] = parseInt(highs[i]);
  }
  localStorage.setItem("tetris.highs", highs);
}

function getKey(x,y){
  return x.toString() + y.toString();
}

function getRandomPiece(){
  let lightblue = [{x: 3, y:0}, //straight
                    {x: 4, y:0},
                    {x: 5, y:0},
                    {x: 6, y:0}];
  let pink = [{x: 4, y:0}, //straight
                {x: 5, y:0},
                {x: 4, y: 1},
                {x: 5, y: 1}];
  let green = [{x: 3, y: 1},//S
                  {x: 4, y: 1},
                  {x: 4, y:0},
                  {x: 5, y:0}];
  let red = [{x: 3, y:0}, //Z
                {x: 4, y:0},
                {x: 4, y: 1},
                {x: 5, y: 1}];
  let purple = [{x: 3, y:1}, //T
                {x: 4, y:1},
                {x: 5, y: 1},
                {x: 4, y: 0}];
  let orange = [{x: 3, y:1}, //L
                {x: 4, y:1},
                {x: 5, y: 1},
                {x: 5, y: 0}];
  let blue = [{x: 3, y:1}, //J
                {x: 4, y:1},
                {x: 5, y: 1},
                {x: 3, y: 0}];
  let pieces = [{color: "lightblue", pieces: lightblue, orientation: "horizontal"},
                  {color: "pink", pieces: pink},
                  {color: "green", pieces: green, orientation: "horizontal"},
                  {color: "red", pieces: red, orientation: "horizontal"},
                  {color: "purple", pieces: purple, orientation: "up"},
                  {color: "blue", pieces: blue, orientation: "up"},
                  {color: "orange", pieces: orange, orientation: "up"}];
  return pieces[Random.nextRange(0,7)];
}

function sortNumber(b,a) {
    return a - b;
}

function sortScore(b,a) {
    return a-b;
}

function setScoreText(level, score, cleared){
  document.getElementById("score").innerText = "level: " + level.toString() + "   score: " + score.toString()+ "   lines cleared: " + cleared.toString();
}
//got this from here to hide all elements of class
//https://stackoverflow.com/questions/11254429/hiding-all-elements-with-the-same-class-name/11254446
function toggle(className, displayState){
    var elements = document.getElementsByClassName(className)
    for (var i = 0; i < elements.length; i++){
        elements[i].style.display = displayState;
    }
}
