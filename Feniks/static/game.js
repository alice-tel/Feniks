var config = {
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autocenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    parent: 'phaser-parent',
    dom: {
        createContainer: true
    }
};
// Game variables
var game = new Phaser.Game(config);
var isGameOver = false;
var isGameRunning = false;
var gameWidth;
var gameHeight;
var middelOfScreen;
var score = 0;
var scoreText;

// Menu items
var menuText;
var menuBG;
var startButton;
var codeText;
var invoerButton;
var opnieuwButton;
var stopButton;


// Player variables
var phoenix;
var phoenixVelocity = -300;
var playerX = 100;
var playerY = 450;
var playerGravity = 300;

// Pillar variables
var pillars;
var pillarLow;
var pillarHigh;
var pillarWidth = 32;
var pillarHeight = 64;
var minPillarDistance= 100;
var pillarDistance = 300;
var pillarSpeed = -100;
var pillarGap = 192;
var pillarRandomLow;
var usePillar = 'pillar1';

function preload ()
{
    // Load all assets into memory
    this.load.image('pillar1', '/static/assets/pillar1.png');
    this.load.image('pillar2', '/static/assets/pillar2.png');
    
    this.load.image('sky', '/static/assets/sky.png');
    this.load.image('menuBG', '/static/assets/menuBg.png');

    this.load.image('startButton', '/static/assets/startButton.png');
    this.load.image('invoerButton', '/static/assets/invoerButton.png');
    this.load.image('opnieuwButton', '/static/assets/opnieuwButton.png');
    this.load.image('stopButton', '/static/assets/stopButton.png');

    this.load.spritesheet('phoenix',
        '/static/assets/phoenix.png',
        { frameWidth: 64, framHeifht: 64 }
    );
    // Load rexui plugin
    this.load.scenePlugin({
		key: 'rexuiplugin',
		url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
		sceneKey: 'rexUI'
	})
	
	this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true)

    // fill game stats
    gameWidth = this.sys.game.canvas.width;
    gameHeight = this.sys.game.canvas.height;
    middelOfScreen = gameWidth/2;
}

function create ()
{
    // Get input
    cursors = this.input.keyboard.createCursorKeys();

    // Set static elements
    bg = this.add.image(0, 0, 'sky').setOrigin(0, 0);
    bg.setScale(2);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.depth = 10;

    // Create the 'main' menu
    menuBG = this.add.image(0, 0, 'menuBG').setOrigin(0, 0);
    menuBG.setScale(2);
    menuBG.depth = 9;

    menuText = this.add.text(middelOfScreen, 32, 'Menu', { fontSize: '64px', fill: '#fff' })
    menuText.depth = 10;

    startButton = this.add.image(middelOfScreen, 128, 'startButton').setOrigin(0,0);
    startButton.setInteractive();
    startButton.depth = 10;

    codeText = this.add.text(middelOfScreen, 256, "Voer je code in").setOrigin(0,0);
    codeText.depth = 10;
    codeText.setInteractive().on('pointerdown', () => {
        this.rexUI.edit(codeText);
    });

    invoerButton = this.add.image(middelOfScreen, 384, 'invoerButton').setOrigin(0,0);
    invoerButton.setInteractive();
    invoerButton.depth = 10;
   
    // Create the 'game over' menu and hide it
    opnieuwButton = this.add.image(middelOfScreen, 128, 'opnieuwButton').setOrigin(0,0);
    opnieuwButton.setInteractive();
    opnieuwButton.depth = 10;
    opnieuwButton.visible = false;

    stopButton = this.add.image(middelOfScreen, 256, 'stopButton').setOrigin(0,0);
    stopButton.setInteractive();
    stopButton.depth = 10;
    stopButton.visible = false;

    // Create the player
    createPlayer(this);

    // Create the pillars and add them in a group
    pillarsLow = this.add.group();
    pillarsHigh = this.add.group();

    let amountOfPillars = Math.ceil(gameWidth/(pillarWidth + minPillarDistance));
    console.log(amountOfPillars);
    for (let i = 0; i < amountOfPillars; i++)
    {
        let x = (gameWidth/2) + (i * pillarDistance);

        pillarSpawn(this, x);
    }

    // Add Overlap event
    this.physics.add.overlap(phoenix, pillarsLow, overlapping);
    this.physics.add.overlap(phoenix, pillarsHigh, overlapping);

    // Make the buttons interactable
    startButton.on('pointerup', startGame);
    invoerButton.on('pointerup', codeIntake);

    opnieuwButton.on('pointerup', resetGame);
    stopButton.on('pointerup', quitGame);

}

function update ()
{
    if (isGameRunning)
    {
        playerMovement()

        // Reset the pillars to the right if they get out of screen on the left
        // Give score if the player is at the same spot as a pillar
        pillarsLow.children.iterate(pillar => {
            if (pillar.body.x < playerX && pillar.body.x > playerX -2)
                {
                    console.log("adding score");
                    score++;
                    setScore();
                }
            else if (pillar.body.x < 0 - pillarWidth)
            {   
                pillarReset(pillar, 'low');
            }
        });
        pillarsHigh.children.iterate(pillar => {
            if (pillar.body.x < 0 - pillarWidth)
            {   
                pillarReset(pillar, 'high');
            }
        });

    }
    else
    {
        pauseGame();
    }
}

function createPlayer(scene)
{
    // Set the sprite of the player
    phoenix = scene.physics.add.sprite(playerX, playerY, 'phoenix');
    
    // Set the colliders
    phoenix.setCollideWorldBounds(true);
    
    // Create the animations
    scene.anims.create({
        key: 'down',
        frames: scene.anims.generateFrameNumbers('phoenix', { start: 0, end: 0 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'up',
        frames: scene.anims.generateFrameNumbers('phoenix', { start: 1, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    phoenix.body.setGravityY(playerGravity);
    phoenix.body.onOverlap = true;
}

function playerMovement()
{
    if (cursors.up.isDown)
    {
        phoenix.setVelocityY(phoenixVelocity);
    }

    if (phoenix.body.velocity.y >= 0)
    {
        phoenix.anims.play('down', true);
    }
    else
    {
        phoenix.anims.play('up', true);
    }
}

function pillarSpawn(scene, x)
{
    // Calculate the scale
    var scaleBy = getScale();

    // Initial y value
    let lowY = gameHeight - (pillarHeight/2);
    let highY = pillarHeight / 2;

    // Spawn the pillars
    pillarLow = scene.physics.add.sprite(x, lowY, usePillar).setImmovable(true);
    pillarHigh = scene.physics.add.sprite(x, highY, usePillar,).setImmovable(true);

    // Scale the pillars
    setScale('low', pillarLow, scaleBy.low);
    setScale('high', pillarHigh, scaleBy.high);

    // Dissable gravity and give speed
    pillarLow.body.setAllowGravity(false);
    pillarLow.setVelocityX(pillarSpeed);

    pillarHigh.body.setAllowGravity(false);
    pillarHigh.setVelocityX(pillarSpeed);

    // Add the object to the group
    pillarsLow.add(pillarLow, scene);
    pillarsHigh.add(pillarHigh, scene);
}

function pillarReset(pillar, place)
{
    let x = pillar.body.x;

    if (place == 'low')
    {
        // Iterate through the pillarsLow and get the highest x
        pillarsLow.children.iterate(pillar => {
            if (pillar.body.x > x)
            {
                x = pillar.body.x;

            }
        })
    }
    else if (place == 'high')
    {
        // Iterate through the pillarsHigh and get the highest x
        pillarsHigh.children.iterate(pillar => {
            if (pillar.body.x > x)
            {
                x = pillar.body.x;
            }
        })
    }
    
    // Set the new x value for the pillar and scale it to size
    pillar.body.x = x + pillarDistance;
    let scale = getScale(true, place)
    setScale(place, pillar, scale)
}

function getScale(single = false, place)
{
    if(!single)
    {
        // Calculate the height for the pillars
        let pillarLowHeight = Math.floor(Math.random() * (gameHeight - pillarGap)) - (pillarHeight/2);
        let pillarHighHeight = (gameHeight - pillarGap) - pillarLowHeight;
            
        // Calculate the scale for the pillars
        let scaleLowBy = pillarLowHeight / pillarHeight; 
        let scaleHighBy = pillarHighHeight / pillarHeight;

        return{
            low: scaleLowBy,
            high: scaleHighBy
        };
    }
    else if (place == 'low')
    {
        // Calculate the height for the pillar
        pillarRandomLow = Math.floor(Math.random()* (gameHeight - pillarGap));
        let pillarLowHeight =  pillarRandomLow - (pillarHeight/2);
            
        // Calculate the scale for the pillars
        let scaleLowBy = pillarLowHeight / pillarHeight; 

        return scaleLowBy;
    }
    else if (place == 'high')
    {
        let scaleHighBy;

        // Calculate the height of the lower pillar and base the height of the higher pillar on that
        let lowHeight = pillarRandomLow - (pillarHeight/2);
        let pillarHighHeight = (gameHeight - pillarGap) - lowHeight;

        // Calculate the scale for the pillars 
        scaleHighBy = pillarHighHeight / pillarHeight;

        return scaleHighBy;
    }
}

function setScale(place, pillar, scale)
{
    if (place == 'low')
    {
        pillar.scaleY = scale;
        let newLowHeight = pillar.height * scale;
        let y = gameHeight - (newLowHeight / 2);
        pillar.y = y;
    }
    else if (place == 'high')
    {
        pillar.scaleY = scale;
        let newHighHeight = pillar.height * scale;
        let y = newHighHeight/2;
        pillar.y = y;
    }
}

function overlapping()
{
    //game.scene.pause("default");
    isGameRunning = false;
    isGameOver = true;
    menuScreen(true);
}

function setScore()
{
    console.log(score);
    scoreText.setText('Score: ' + score);
}

function startGame()
{
    // Disable the menu and start the game
    menuText.visible = false;
    menuBG.visible = false;
    if (isGameOver)
    {
        opnieuwButton.visible = false;
        opnieuwButton.setInteractive(false);

        stopButton.visible = false;
        stopButton.setInteractive(false);
    }
    else
    {
        startButton.visible = false;
        startButton.setInteractive(false);

        codeText.visible = false;
        codeText.setInteractive(false);

        invoerButton.visible = false;
        invoerButton.setInteractive(false);
    }
    isGameRunning = true;
    pauseGame();
}

function pauseGame()
{
    // if paused pause all the items in the game by stopping their movement
    // else unpause everything
    if (isGameRunning)
    {
        phoenix.setGravityY(playerGravity);
        pillarsLow.children.iterate(pillar => {
            pillar.setVelocityX(pillarSpeed);
        });
        pillarsHigh.children.iterate(pillar => {
            pillar.setVelocityX(pillarSpeed);
        });
    }
    else
    {
        phoenix.setGravityY(0);
        phoenix.setVelocityY(0);
        pillarsLow.children.iterate(pillar => {
            pillar.setVelocityX(0);
        });
        pillarsHigh.children.iterate(pillar => {
            pillar.setVelocityX(0);
        });
    }
}

function resetGame()
{
    // Reset the pillars to starting position
}

function quitGame()
{
    // Redirect to the homepage?
}

function codeIntake()
{
    // Handle the code input
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/getskin/", true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(codeText.text));

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
        }
    };
}

function menuScreen(gameOver=false)
{
    // Show menu if game over. Show the buttons retry and quit. Also show the score on top and say that you are game over.
    if (gameOver)
    {
        menuBG.visible = true;
        menuText.text = "Game over";
        menuText.visible = true;
        opnieuwButton.visible = true;
        stopButton.visible = true;
    }
    // Show the main menu screen. Play button and input field and use code button
    else
    {

    }
}