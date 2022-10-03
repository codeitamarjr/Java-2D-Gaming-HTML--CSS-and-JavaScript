// It'll load when the page load everthing.
window.addEventListener('load', function() {
    // Canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); // Could be 2d or 3d which is WebGL
    canvas.width = 500;
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
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    // It'll handle particles when the player laser hit the enemy
    class Particle {

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
            // Property of moviment
            this.speedY = 0;
            this.maxSpeed = 3;
            // It'll handle the projectiles
            this.projectiles = [];
        }
        update() {
            // Update the character position based on the input
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            // It'll update the character position
            this.y += this.speedY;
            // It'll handle the projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

        }
        draw(context) {
            // It'll draw the character
            context.fillStyle = 'green';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop() {
            // Limit the ammount of shots
            if (this.game.ammo > 0) {
                // It'll create a new projectile and adjust the position X and Y
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                // It'll decrease the ammo for each shot
                this.game.ammo--;
            }

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
            this.lives = 5;
            this.score = this.lives;
        }
        update() {
            // It'll update the enemy position
            this.x += this.speedY;
            // It'll check if the enemy is out of the screen
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context) {
            // It'll draw the enemy
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.fillText(this.lives, this.x, this.y);
        }
    }
    class SmallEnemy extends Enemy {
        constructor(game) {
            // It'll call the parent constructor
            super(game);
            // Size of the enemy
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            // Position of the enemy
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }
    // It'll handle invidual background layers
    class Layer {

    }
    // It'll handle all layes objects together ( Animate the world)
    class Background {

    }
    // It'll draw score, timer and other stuff
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Arial';
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
            // draw the ammo for each shoot
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
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
                    message1 = 'You Win!';
                    message2 = 'Congratulations!';
                } else {
                    message1 = 'Game Over!';
                    message2 = 'Try again!';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            context.restore();
        }
    }
    // It'll handle the game logic
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
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
            this.timeLimit = 10000;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollisions(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollisions(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
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
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy() {
            this.enemies.push(new SmallEnemy(this));
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