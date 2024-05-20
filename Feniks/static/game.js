var config = {
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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
var invoerButton;
var opnieuwButton;
var stopButton;


// Player variables
var phoenix;
var phoenixVelocity = -350;
var playerX = 100;
var playerY = 450;

// Pillar variables
var pillars;
var pillarLow;
var pillarHigh;
var pillarWidth = 32;
var pillarHeight = 64;
var minPillarDistance= 100;
var pillarDistance = 300;
var pillarSpeed = 100;
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
    this.load.image('opnieuwButton', '/static/assets/invoerButton.png');
    this.load.image('stopButton', '/static/assets/stopButton.png');

    this.load.spritesheet('phoenix',
        '/static/assets/phoenix.png',
        { frameWidth: 64, framHeifht: 64 }
    );

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
    startButton.on('pointerover', () => {console.log("hover")})
    startButton.on('pointerup', startGame);

    invoerButton = this.add.image(middelOfScreen, 384, 'invoerButton').setOrigin(0,0);
    invoerButton.setInteractive();
    invoerButton.depth = 10;
   
    // Create the 'game over' menu and hide it
    opnieuwButton = this.add.image(middelOfScreen, 128, 'opnieuwButton').setOrigin(0,0);
    opnieuwButton.depth = 10;
    opnieuwButton.visible = false;

    stopButton = this.add.image(middelOfScreen, 256, 'stopButton').setOrigin(0,0);
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
                pillarReset(this, pillar, 'low');
            }
        });
        pillarsHigh.children.iterate(pillar => {
            if (pillar.body.x < 0 - pillarWidth)
            {   
                pillarReset(this, pillar, 'high');
            }
        });

    }
    else
    {
        game.scene.pause("default");
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

    phoenix.body.setGravityY(300);
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
    pillarLow.setVelocityX(-pillarSpeed);

    pillarHigh.body.setAllowGravity(false);
    pillarHigh.setVelocityX(-pillarSpeed);

    // Add the object to the group
    pillarsLow.add(pillarLow, scene);
    pillarsHigh.add(pillarHigh, scene);
}

function pillarReset(scene, pillar, place)
{
    let x = pillar.body.x;
    if (place == 'low')
    {
        pillarsLow.children.iterate(pillar => {
            if (pillar.body.x > x)
            {
                x = pillar.body.x;

            }
        })
    }
    else if (place == 'high')
    {
        pillarsHigh.children.iterate(pillar => {
            if (pillar.body.x > x)
            {
                x = pillar.body.x;
            }
        })
    }

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
    if (gameOver)
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

        invoerButton.visible = false;
        invoerButton.setInteractive(false);
    }
}

function menuScreen(gameOver=false)
{
    // Show menu if game over. Show the buttons retry and quit. Also show the score on top and say that you are game over.
    if (gameOver)
    {

    }
    // Show the main menu screen. Play button and input field and use code button
    else
    {

    }
}