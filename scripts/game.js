const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 45;
const X_OFFSET = 290;
const Y_OFFSET = 70;
let canvas = document.getElementById("id-canvas");
let context = canvas.getContext("2d");

MyGame.main = (function (systems, renderer, assets, graphics) {
    'use strict';

    let lastTimeStamp = performance.now();
    //
    // Define a sample particle system to demonstrate its capabilities
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

    //------------------------------------------------------------------
    //
    // Update the particles
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        //
        // Tell the existing particles to update themselves
        drawBoard();
        // particlesSmoke.update(elapsedTime);
        // particlesFire.update(elapsedTime);
    }

    //------------------------------------------------------------------
    //
    // Render the particles
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear(assets["background"]);
        drawBoard();
        renderSmoke.render();
        renderFire.render();

    }

    //------------------------------------------------------------------
    //
    // This is the Game Loop function!
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);

        update(elapsedTime);
        lastTimeStamp = time;

        render();

        requestAnimationFrame(gameLoop);
    };

    //------------------------------------------------------------------
    //
    // Want to expose this to allow the loader code to call this when all
    // is ready to go.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log('game initializing...');
        requestAnimationFrame(gameLoop);
    }

    function drawBoard() {
      for(let x = 0; x < GRID_WIDTH; x++){
        for(let y = 0; y< GRID_HEIGHT; y++){
          //need logic here to determine if piece occupies cell. if so, put that piece color. otherwise, put white piece
          graphics.drawTexture(assets['white'], {x:x*CELL_SIZE+X_OFFSET, y:y*CELL_SIZE+Y_OFFSET}, 0, {x:CELL_SIZE, y:CELL_SIZE});
        }
      }
    }


    return {
        initialize: initialize
    };

}(MyGame.systems, MyGame.render, MyGame.assets, MyGame.graphics));

function startGame(){
  MyGame.main.initialize();
}

function highScores(){
  // highs = highs.sort(sortNumber);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  // context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("high scores:", 20, 100);
  // context.fillText("1. " + highs[0], 40, 250);
  // context.fillText("2. " + highs[1], 40, 300);
  // context.fillText("3. " + highs[2], 40, 350);
  // context.fillText("4. " + highs[3], 40, 400);
  // context.fillText("5. " + highs[4], 40, 450);
}

function credits(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(MyGame.assets["background"], 0, 0);
  // context.fillStyle = "white";
  context.font = "20px Courier New";
  context.fillText("credits:", 20, 100);
  context.fillText("by alan henderson", 40, 150);
  context.fillText("all assets from opengameart.org", 40, 200);
}
