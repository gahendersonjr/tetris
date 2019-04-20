MyGame.systems.ParticleSystem = function() {
    'use strict';
    let nextName = 1;
    let particles = {};

    function create(x,y,direction, lifetime) {
        let p = {
                center: { x: x, y: y },
                size: { x: 10, y: 10},  // Making square particles
                direction: direction,
                speed: Random.nextGaussian(20, 5), // pixels per second
                rotation: 0,
                lifetime: lifetime,    // How long the particle should live, in seconds
                alive: 0    // How long the particle has been alive, in seconds
            };

        particles[nextName++] = p;
    }

    function createRowParticles(row){
      let x;
      let y;
      let direction;
      let random = Random.nextRange(0,4);
      switch(random){
        case 1:
          direction = {x: 0, y: -1};//up
          x = Random.nextRange(178,628);
          y=row*45+47.5;
          break;
        case 2:
          direction = {x: 0, y: 1};//down
          x = Random.nextRange(178,628);
          y=row*45+92.5;
          break;
        case 3:
          direction = {x: -1, y: 0};//left
          x = x=177.5;//left side;
          y=row*45+Random.nextRange(48,93);
          break;
        default:
          direction = {x: 1, y: 0};//right
          y=row*45+Random.nextRange(48,93);
          x = 627.5;//right side
          break;
      }
      create(x,y, direction, Random.nextGaussian(2,.5));
    }

    function createCellParticles(row, column, dir){
      let direction;
      let x;
      let y;
      if(dir=="left"){
        y=Random.nextRange(48+45*column, 93+45*column);
        x=row*45+177.5;
        direction = {x: -1, y: 0};//left
      }else if(dir=="right"){
        y=Random.nextRange(48+45*column, 93+45*column);
        x=row*45+225.5;
        direction = {x: 1, y: 0};//right
      }else if(dir=="up"){
        x=Random.nextRange(177+45*row, 222+45*row);
        y=column*45+47.5;
        direction = {x: 0, y: -1};//up
      }else if(dir=="down"){
        x=Random.nextRange(177+45*row, 222+45*row);
        y=column*45+92.5;
        direction = {x: 0, y: 1};//down
      }
      create(x,y,direction, Random.nextGaussian(.4,.1));
    }

    function update(elapsedTime) {
        let removeMe = [];

        elapsedTime = elapsedTime / 1000;

        Object.getOwnPropertyNames(particles).forEach(function(value, index, array) {
            let particle = particles[value];
            particle.alive += elapsedTime;

            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            particle.rotation += particle.speed / 500;

            if (particle.alive > particle.lifetime) {
                removeMe.push(value);
            }
        });

        for (let particle = 0; particle < removeMe.length; particle++) {
            delete particles[removeMe[particle]];
        }
        removeMe.length = 0;
    }

    let api = {
        update: update,
        createRowParticles: createRowParticles,
        createCellParticles: createCellParticles,
        get particles() { return particles; }
    };

    return api;
}
