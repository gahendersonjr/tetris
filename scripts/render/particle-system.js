// --------------------------------------------------------------
//
// Renders the particles in a particle system
//
// --------------------------------------------------------------
MyGame.render.ParticleSystem = function(system, graphics, image) {
    'use strict';

    //------------------------------------------------------------------
    //
    // Render all particles
    //
    //------------------------------------------------------------------
    function render() {
        Object.getOwnPropertyNames(system.particles).forEach( function(value) {
            let particle = system.particles[value];
            graphics.drawTexture(image, particle.center, particle.rotation, particle.size);
        });
    }

    let api = {
        render: render
    };

    return api;
};
