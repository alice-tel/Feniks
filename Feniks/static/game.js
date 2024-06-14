var config = {
    // width: 412,
    // height: 915,
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
        // width: window.innerWidth,
        // height: window.innerHeight,
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
var isSeeingScore = false;
var isResettingGame = false
var isOverlapping = false;
var gameWidth;
var gameHeight;
var middelOfScreen;
var score = 0;
var scoreText;
var isHighScore;
var scoreBoardText;
var bg;
var backButtonStartY = 256

// Menu items
var menuText;
var menuBG;
var startButton;
var codeText;
var invoerButton;
var opnieuwButton;
var stopButton;
var backButton;


// Player variables
var phoenix;
var phoenixVelocity = -250;
var playerX = 100;
var playerY = 450;
var playerGravity = 300;

// Pillar variables
var pillars;
var amountOfPillars;
var pillarLow;
var pillarHigh;
var pillarWidth = 32;
var pillarHeight = 64;
var minPillarDistance= 100;
var pillarDistance = 300;
var pillarSpeed = -100;
var pillarGap = 300;
var pillarRandomLow;
var usePillar = 'pillar1';

function preload ()
{
    // Load all assets into memory
    this.load.image('pillar1', '/static/assets/pillar1.png');
    this.load.image('pillar2', '/static/assets/pillar2.png');
    this.load.image('harry1', '/static/assets/brickwall_01.png');
    
    this.load.image('sky', '/static/assets/sky.png');
    this.load.image('menuBG', '/static/assets/menuBg.png');
    this.load.image('harry2', '/static/assets/harry_background.png');

    this.load.image('startButton', '/static/assets/startButton.png');
    this.load.image('invoerButton', '/static/assets/invoerButton.png');
    this.load.image('opnieuwButton', '/static/assets/opnieuwButton.png');
    this.load.image('stopButton', '/static/assets/stopButton.png');
    this.load.image('backButton', '/static/assets/backButton.png');
    this.load.image('scoreButton', '/static/assets/scoreButton.png');
    this.load.image('opslaanButton', '/static/assets/opslaanButton.png');

    this.load.image('highscoreBG', '/static/assets/scoreboard_background2.png')

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

    // Create the 'main' menu and hide it
    menuBG = this.add.image(0, 0, 'menuBG').setOrigin(0, 0);
    menuBG.setScale(2);
    menuBG.depth = 9;
    menuBG.visible = false

    menuText = this.add.text(middelOfScreen, 32, 'Menu', { fontSize: '64px', fill: '#fff' })
    menuText.x -= (menuText.width / 2);
    menuText.depth = 10;

    startButton = this.add.image(middelOfScreen, 128, 'startButton').setOrigin(0,0);
    startButton.x -= (startButton.width / 2);
    startButton.setInteractive();
    startButton.depth = 10;
    startButton.visible = false;

    codeText = this.add.text(middelOfScreen, 256, "Voer je code in").setOrigin(0,0);
    codeText.x -= (codeText.width / 2);
    codeText.depth = 10;
    codeText.setInteractive().on('pointerdown', () => {
        let currentWidth = codeText.width;
        codeText.text = "";
        codeText.width = currentWidth;
        this.rexUI.edit(codeText);
    });
    codeText.visible = false;

    invoerButton = this.add.image(middelOfScreen, 384, 'invoerButton').setOrigin(0,0);
    invoerButton.x -= (invoerButton.width / 2);
    invoerButton.setInteractive();
    invoerButton.depth = 10;
    invoerButton.visible = false;

    scoreButton = this.add.image(middelOfScreen, 512, 'scoreButton').setOrigin(0,0);
    scoreButton.x -= (scoreButton.width / 2);
    scoreButton.setInteractive();
    scoreButton.depth = 10;
    scoreButton.visible = false

    // Create the 'game over' menu and hide it
    opnieuwButton = this.add.image(middelOfScreen, 128, 'opnieuwButton').setOrigin(0,0);
    opnieuwButton.x -= (opnieuwButton.width / 2);
    opnieuwButton.setInteractive();
    opnieuwButton.depth = 10;
    opnieuwButton.visible = false;

    // If the player has a score that lands in the top 10 show this message and a spot to fill in a name
    highscoreText = this.add.text(middelOfScreen, 256, "Gefeliciteerd, je staat in de top 10!").setOrigin(0,0);
    highscoreText.depth = 10;
    // highscoreText.x = middelOfScreen - ((highscoreText.width - opnieuwButton.width)/2);
    highscoreText.x = middelOfScreen - (highscoreText.width / 2);
    highscoreText.visible = false;

    nameText = this.add.text(middelOfScreen, 384, 'Vul hier een 3 letter naam in').setOrigin(0,0);
    nameText.depth = 10;
    // nameText.x = middelOfScreen - ((nameText.width - opnieuwButton.width)/2);
    nameText.x = middelOfScreen - (nameText.width / 2);
    nameText.setInteractive().on('pointerdown', () => {
        let currentWidth = nameText.width;
        nameText.text = "";
        nameText.width = currentWidth;
        nameText.x = middelOfScreen - (currentWidth/2);
        this.rexUI.edit(nameText);
    })
    nameText.visible = false;

    opslaanButton = this.add.image(middelOfScreen, 512, 'opslaanButton').setOrigin(0,0);
    opslaanButton.x -= (opslaanButton.width / 2);
    opslaanButton.setInteractive();
    opslaanButton.depth = 10;
    opslaanButton.visible = false;



    // stopButton = this.add.image(middelOfScreen, 256, 'stopButton').setOrigin(0,0);
    // stopButton.setInteractive();
    // stopButton.depth = 10;
    // stopButton.visible = false;

    backButton = this.add.image(middelOfScreen, backButtonStartY, 'backButton').setOrigin(0,0);
    backButton.x -= (backButton.width / 2); 
    backButton.setInteractive();
    backButton.depth = 10;
    backButton.visible = false;

    // Create the text field that will store the scoreboard and hide it
    scoreboardTextObject = this.add.text(middelOfScreen, 256, 'Scoreboard', { fontSize: '48px', fill: '#0026FF'}).setOrigin(0,0);
    scoreboardTextObject.depth = 10;
    scoreboardTextObject.visible = false;

    scoreboardBG = this.add.image(middelOfScreen, 256, 'highscoreBG').setOrigin(0,0);
    scoreboardBG.x -= (scoreboardBG.width / 2);
    scoreboardBG.depth = 9;
    scoreboardBG.visible = false;

    // Create the player
    createPlayer(this);

    // Create the pillars and add them in a group
    pillarsLow = this.add.group();
    pillarsHigh = this.add.group();

    amountOfPillars = Math.ceil(gameWidth/(pillarWidth + minPillarDistance));
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
    scoreButton.on('pointerup', scoreBoard);

    opnieuwButton.on('pointerup', resetGame);
    opslaanButton.on('pointerup', addToHighscore)
    // stopButton.on('pointerup', quitGame);
    backButton.on('pointerup', backGame);

    menuScreen();
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
                    score++;
                    setScore();
                    if (pillarGap > 192)
                    {
                        pillarGap -= 2;
                    }
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
    scene.physics.world.on('worldbounds', (body, up, down, left, right) =>
        {
            if (down)
            {
                 overlapping();
            }
        });
    
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
    phoenix.body.onWorldBounds = true;

    // hitbox excluding wings
    phoenix.body.setSize(60,19, true)
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
        // hitbox including wings
        // phoenix.body.setSize(60, 41);
        // phoenix.body.setOffset(0, 0);
    }
    else
    {
        phoenix.anims.play('up', true);
        // hitbox including wings
        // phoenix.body.setSize(60, 41);
        // phoenix.body.setOffset(0, 23);
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
    if (isResettingGame)
    {
        pillar.x = pillar.body.x;
    }
    let scale = getScale(true, place);
    setScale(place, pillar, scale);
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

    if (!isGameOver)
    {
        // Send code to database and receive if it is in top 10
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/checkscore", true);

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(score));

        xhr.onload = function() {
            if (xhr.status === 200 && xhr.responseText == "true\n"){
                isHighScore = true
                menuScreen(true);
            }
        }  
    }
    if (!isOverlapping)
    {   
        isOverlapping = true
        isGameRunning = false;
        isGameOver = true;
        menuScreen(true);
    }

}

function setScore()
{
    scoreText.setText('Score: ' + score);
}

function startGame()
{
    // Disable the menu and start the game
    menuScreen(false, true);
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
    isResettingGame = true;
    pillarsLow.children.iterate(pillar => {
        pillar.body.x = (gameWidth / 2) - pillarDistance;
    });
    pillarsHigh.children.iterate(pillar => {
        pillar.body.x = (gameWidth / 2) - pillarDistance;
    });

    for (let i = 0; i < amountOfPillars; i++)
        {
            pillarReset(pillarsLow.getChildren()[i], "low");
            pillarReset(pillarsHigh.getChildren()[i], "high");
        }

    isGameRunning = true;
    score = 0;
    setScore();
    phoenix.body.y = playerY;
    phoenix.y = playerY
    menuScreen(false, true);
    isGameOver = false;
    menuScreen(false, true);
    isSeeingScore = false;
    isResettingGame = false;
    isHighScore = false;
    isOverlapping = false;
    pauseGame();
}

function quitGame()
{
    // Redirect to the homepage?
}

function backGame()
{
    resetGame();
    isGameRunning = false;
    pauseGame();
    menuScreen();
}

function codeIntake()
{
    // Handle the code input
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/getskin/", true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(codeText.text));

    // Make the return value the new texture
    xhr.onload = function() {
        if (xhr.status === 200) {
            usePillar = xhr.responseText + "1";
            usePillar = usePillar.replace(/"/g, "");
            usePillar = usePillar.replace(/\n/g, "");
            pillarsLow.children.iterate(pillar => {
                pillar.setTexture(usePillar);
            });
            pillarsHigh.children.iterate(pillar => {
                pillar.setTexture(usePillar);
            });
            let bgPic = xhr.responseText + "2";
            bgPic = bgPic.replace(/"/g, "");
            bgPic = bgPic.replace(/\n/g, "");
            bg.setTexture(bgPic);
            bg.setScale(12);
        }
    };
}

function menuScreen(gameOver=false, play=false, showScore = false)
{
    // Show menu if game over. Show the buttons retry and quit. Also show the score on top and say that you are game over.
    if (gameOver)
    {
        menuBG.visible = true;
       
        menuText.text = "Game over";
        menuText.x = middelOfScreen - (menuText.width / 2);
        menuText.visible = true;
        
        opnieuwButton.visible = true;
       
        backButton.visible = true;
        backButton.y = backButtonStartY;
        if (isHighScore)
        {
            highscoreText.visible = true;
            nameText.visible = true;
            opslaanButton.visible = true;

            backButton.y = backButtonStartY + 384;
        }
    }
    // remove menu screen
    else if (play)
    {
        menuText.visible = false;
        menuBG.visible = false;
        if (isGameOver)
        {
            opnieuwButton.visible = false;
    
            backButton.visible = false;

            if (isHighScore)
                {
                    highscoreText.visible = false;
                    nameText.visible = false;
                    opslaanButton.visible = false;
                    backButton.y = backButtonStartY;
                }
        }
        else if (isSeeingScore)
        {    
            backButton.y = backButtonStartY;
            scoreboardTextObject.visible = false;
            scoreboardBG.visible = false;
    
            backButton.visible = false;
        }
        else
        {
            startButton.visible = false;
    
            codeText.visible = false;
    
            invoerButton.visible = false;

            scoreButton.visible = false;
        }
    }
    // Show the main menu screen. Play button and input field and use code button
    else if (showScore)
    {
        menuBG.visible = true;

        menuText.text = "Scorebord";
        menuText.x = middelOfScreen - (menuText.width/2);
        menuText.visible = true;

        scoreboardTextObject.text = scoreBoardText;
        scoreboardTextObject.visible = true;
        scoreboardTextObject.x = middelOfScreen - (scoreboardTextObject.width / 2);

        scoreboardBG.visible = true;
        scoreboardBG.y = scoreboardTextObject.y + ((scoreboardBG.height - scoreboardTextObject.height) / 4);
        
        backButton.visible = true;
        backButton.y = backButtonStartY + (scoreboardTextObject.height + 64);
    }
    else
    {
        menuBG.visible = true;

        menuText.text = "Menu";
        menuText.x = middelOfScreen - (menuText.width/2);
        menuText.visible = true;

        startButton.visible = true;
        
        codeText.visible = true;
        codeText.text = "Voer je code in";
        
        invoerButton.visible = true;

        scoreButton.visible = true;
    }
}

function scoreBoard()
{
    // Get scoreboard data from the server and format the data into a string
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/getscore", true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send("");
    xhr.onload = function(){
        if (xhr.status === 200){
            // Get the data and put that into the text variable
            // The data gets in with quotes and comma's because literal \n doesn't work. The code below is the only way I got it to work
            scoreBoardText = xhr.responseText.replace(/,/g, "\n").replace(/"/g, '');
            menuScreen(false, true);
            menuScreen(false, false, true);
            isSeeingScore = true;
        }
    } 
}

function addToHighscore()
{
    highscoreData = [nameText.text, score];
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/submitscore", true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(highscoreData));

    xhr.onload = function() {
        if (xhr.status === 200)
        {
            if (xhr.responseText != "true\n")
            {
                alert(xhr.responseText);
            }
            else
            {   
                menuScreen(false, true);
                scoreBoard();
            }
        }
    }
}