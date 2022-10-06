// It'll load when the page load everthing.
window.addEventListener('load', function() {
    // Canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); // Could be 2d or 3d which is WebGL
    canvas.width = 700;
    canvas.height = 500;

    // It'll handle user input
    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                if (((e.key === 'ArrowUp') ||
                        (e.key === 'ArrowDown')
                    ) && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                } else if (e.key === 'd') {
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    // It'll handle player laser
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            // Load sprite for projectile
            this.image = document.getElementById('projectile');
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }
    // It'll handle particles when the player laser hit the enemy
    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            // Randomize the sprite
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            // Set the size of the sprite
            this.spriteSize = 50; // 50x50
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1); // Randomize the size of the sprite
            this.size = this.spriteSize * this.sizeModifier; // Randomize the size
            this.speedX = Math.random() * 6 - 3; // Randomize the speed of the sprite
            this.speedY = Math.random() * -15; // Randomize the vertical axis of the sprite
            this.gravity = 0.5; // Gravity
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1; // Randomize the angle of the sprite
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markedForDeletion = true;
            if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 5) {
                this.speedY *= -0.7;
                this.bounced++;
            }
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize,
                this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5,
                this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }
    // It'll handle the main character
    class Player {
        constructor(game) {
            this.game = game;
            // Size of the character
            this.width = 120;
            this.height = 190;
            // Position of the character
            this.x = 20;
            this.y = 100;
            // The sixe of the sprite of player
            this.frameX = 0;
            this.frameY = 0;
            // Animation of sprite
            this.maxFrame = 37;
            // Property of moviment
            this.speedY = 0;
            this.maxSpeed = 3;
            // It'll handle the projectiles
            this.projectiles = [];
            // Load the sprite
            this.image = document.getElementById('player');
            // Powerup of the character
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime) {
            // Update the character position based on the input
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            // It'll update the character position
            this.y += this.speedY;
            // Vertical boundaries
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            // It'll handle the projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // It'll handle the animation
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
            // Powerup
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }

        }
        draw(context) {
            // It'll draw the character
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            // It'll draw the ammo
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            // Load sprite ( source and destination/position )
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);

        }
        shootTop() {
            // Limit the ammount of shots
            if (this.game.ammo > 0) {
                // It'll create a new projectile and adjust the position X and Y
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                // It'll decrease the ammo for each shot
                this.game.ammo--;
            }
            // Check if is in powerup mode
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() {
                if (this.game.ammo > 0) {
                    this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
                    this.game.ammo--;
                }

            }
            // If the player hit the second lucky being in the lucky mode
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
        }
    }
    // It'll handle many different enemies types
    class Enemy {
        constructor(game) {
            this.game = game;
            // Position of the enemy
            this.x = this.game.width;
            // Property of moviment
            this.speedY = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            // Config for the sprite
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update() {
            // It'll update the enemy position
            this.x += this.speedY - this.game.speed;
            // It'll check if the enemy is out of the screen
            if (this.x + this.width < 0) this.markedForDeletion = true;
            // It'll handle the sprite animation
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        draw(context) {
            // It'll draw the enemy
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            // Draw the sprite
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug) {
                context.font = '20px Arial';
                context.fillText(this.lives, this.x, this.y);
            }
        }
    }
    class Angler1 extends Enemy {
        constructor(game) {
            // It'll call the parent constructor
            super(game);
            // Size of the enemy
            this.width = 228;
            this.height = 169;
            // Position of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            // Load the sprite
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3)
            this.lives = 2;
            this.score = this.lives;
        }
    }
    class Angler2 extends Enemy {
        constructor(game) {
            // It'll call the parent constructor
            super(game);
            // Size of the enemy
            this.width = 213;
            this.height = 165;
            // Position of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            // Load the sprite
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy {
        constructor(game) {
            // It'll call the parent constructor
            super(game);
            // Size of the enemy
            this.width = 99;
            this.height = 95;
            // Position of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            // Load the sprite
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
        }
    }
    // It'll handle invidual background layers
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update() {
            if (this.x < -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            // Fill the gap at the end of the first image
            context.drawImage(this.image, this.x + this.width, this.y);
        }

    }
    // It'll handle all layes objects together ( Animate the world)
    class Background {
        // It'll load all the images together
        constructor(game) {
                this.game = game;
                this.image1 = document.getElementById('layer1');
                this.image2 = document.getElementById('layer2');
                this.image3 = document.getElementById('layer3');
                this.image4 = document.getElementById('layer4');
                this.layer1 = new Layer(this.game, this.image1, 0.2);
                this.layer2 = new Layer(this.game, this.image2, 0.4);
                this.layer3 = new Layer(this.game, this.image3, 1);
                this.layer4 = new Layer(this.game, this.image4, 1.5);
                // Hold all layers into an array
                this.layers = [this.layer1, this.layer2, this.layer3];
            }
            // Move all objects
        update() {
                this.layers.forEach(layer => layer.update());

            }
            // Draw all objects
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));

        }

    }
    // It'll draw score, timer and other stuff
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context) {
            // draw score
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.shadowBlur = 2;
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.fillText(`Score: ${this.game.score}`, 20, 40);

            // Draw the timer formated with 1 decimal
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText(`Timer: ${formattedTime}`, 20, 100);
            // Game over messages 
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                // If the player win
                if (this.game.score > this.game.winningScore) {
                    // Showing funny winning message with score
                    message1 = `Most Wondrous! Your score is ${this.game.score}`;
                    message2 = 'Well done explorer!';
                } else {
                    message1 = 'Blazes!';
                    message2 = 'Get my repair kit and try again!';
                }
                context.font = '40px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }
            // draw the ammo for each shoot
            // Check if the player it's on power up mode and change the color of the UI
            if (this.game.player.powerUp) context.fillStyle = '#ffffbd';
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.restore();
        }
    }
    // It'll handle the game logic
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            // Create background
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.enemiesTimer = 0;
            this.enemiesInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            // Set the time limit for the game
            this.gameTime = 0;
            this.timeLimit = 15000;
            // To control the speed of backgrounds layers
            this.speed = 1;
            // Debug options
            this.debug = false;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollisions(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    // Forloop to create particles
                    for (let i = 0; i < 10; i++) {
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5));
                    }
                    // If the player hit the lucky enemy
                    if (enemy.type === 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollisions(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        // Create particles
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5));
                        if (enemy.lives <= 0) {
                            // Forloop to create particles
                            for (let i = 0; i < 10; i++) {
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5,
                                    enemy.y + enemy.height * 0.5));
                            }
                            enemy.markedForDeletion = true;
                            // Just count the score if gameOver is false
                            if (!this.gameOver) this.score += enemy.score;
                            // Check if the current score is more than the winning score
                            if (this.score > this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) {
                this.addEnemy();
                this.enemiesTimer = 0;
            } else {
                this.enemiesTimer += deltaTime;
            }
        }
        draw(context) {
            // Draw the background
            this.background.draw(context);
            // Draw the UI
            this.ui.draw(context);
            // Draw the player
            this.player.draw(context);
            // Draw the particles
            this.particles.forEach(particle => particle.draw(context));
            // Draw the enemies
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            // Draw the last background layer, which stands in the front
            this.background.layer4.draw(context);
        }
        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
        }
        checkCollisions(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // It'll handle the game/animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});