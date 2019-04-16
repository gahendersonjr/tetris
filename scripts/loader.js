MyGame = {
    systems: {},
    render: {},
    assets: {}
};

MyGame.loader = (function() {
    'use strict';
    let scriptOrder = [{
            scripts: ['random'],
            message: 'Random number generator loaded',
            onComplete: null
        }, {
            scripts: ['systems/particle-system'],
            message: 'Particle system model loaded',
            onComplete: null
        }, {
            scripts: ['Render/core'],
            message: 'Rendering core loaded',
            onComplete: null
        }, {
            scripts: ['Render/particle-system'],
            message: 'Particle system renderer loaded',
            onComplete: null
        }, {
            scripts: ['game'],
            message: 'Game loop and model loaded',
            onComplete: null
        }];
    let assetOrder = [{
        key: 'music',
        source: '/assets/music.mp3'
      },
      {
            key: 'background',
            source: '/assets/background.jpg'
        },
        {
            key: 'fire',
            source: '/assets/fire.png'
        },
        {
            key: 'smoke',
            source: '/assets/smoke.png'
        },
        {
            key: 'red',
            source: '/assets/red.png'
        },
        {
            key: 'blue',
            source: '/assets/blue.png'
        },
        {
            key: 'green',
            source: '/assets/green.png'
        },
        {
            key: 'lightblue',
            source: '/assets/lightblue.png'
        },
        {
            key: 'orange',
            source: '/assets/orange.png'
        },
        {
            key: 'pink',
            source: '/assets/pink.png'
        },
        {
            key: 'purple',
            source: '/assets/purple.png'
        },
        {
            key: 'white',
            source: '/assets/white.png'
        }
      ]

    function loadScripts(scripts, onComplete) {
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                scripts.shift();    // Alternatively: scripts.splice(0, 1);
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    function loadAssets(assets, onSuccess, onError, onComplete) {
        if (assets.length > 0) {
            let entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.shift();
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.shift();
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    function loadAsset(source, onSuccess, onError) {
        let xhr = new XMLHttpRequest();
        let fileExtension = source.substr(source.lastIndexOf('.') + 1);
        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                let asset = null;
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    function mainComplete() {
        console.log('It is all loaded up');
        let canvas = document.getElementById("id-canvas");
        let context = canvas.getContext("2d");
        context.drawImage(MyGame.assets["background"], 0, 0);
    }

    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {  
            MyGame.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All game assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
