MyGame.systems.ParticleSystem = function(spec) {
    'use strict';
    let nextName = 1;
    let particles = {};

    function create() {
        let size = Random.nextGaussian(spec.size.mean, spec.size.stdev);
        let p = {
                center: { x: spec.center.x, y: spec.center.y },
                size: { x: size, y: size},  // Making square particles
                direction: Random.nextCircleVector(),
                speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
                rotation: 0,
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),    // How long the particle should live, in seconds
                alive: 0    // How long the particle has been alive, in seconds
            };

        return p;
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

        for (let particle = 0; particle < 1; particle++) {
            particles[nextName++] = create();
        }
    }

    let api = {
        update: update,
        get particles() { return particles; }
    };

    return api;
}
