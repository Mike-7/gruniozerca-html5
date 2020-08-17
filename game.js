(function() {
    var canvas;
    var context;

    var keys = [];
    var controls = {
        A: 74,
        B: 75,
        UP: 87,
        DOWN: 83,
        LEFT: 65,
        RIGHT: 68
    };
    var fps = 25;

    var spritesToLoad = 0;
    var sprites = [];
    var sounds = [];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function Sprite(title, src, base64 = false) {
        const gfxDir = 'GFX/';

        var image = new Image();
        if(!base64)
            image.src = gfxDir + src;
        else
            image.src = src;
        image.onload = function() {
            sprites[title] = image;
            spritesToLoad--;
        }

        spritesToLoad++;
    }

    function Sound(title, src, loop = false) {
        const sfxDir = 'SFX/';

        var sound = document.createElement('audio');
        sound.src = sfxDir + src;
        sound.setAttribute('preload', 'auto');
        sound.setAttribute('controls', 'none');
        if(loop)
            sound.setAttribute('loop', 'true');
        sound.style.display = 'none';
        sound.volume = 0.1;
        document.body.appendChild(sound);

        sounds[title] = sound;
    }

    function IsColliding(object1, object2) {
        if (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
            object1.y < object2.y + object2.height && object1.y + object1.height > object2.y) {
            return true;
        }

        return false;
    }

    var SceneManager = {
        LoadScene: function(scene) {
            if(this.scene != null)
                this.scene.Clean();
            this.scene = scene;
            this.scene.Start();
        },

        UpdateScene: function() {
            SceneManager.scene.Update();
        },

        GetScene: function() {
            return SceneManager.scene;
        }
    };

    function Init() {
        canvas = document.getElementById('mainCanvas');
        context = canvas.getContext('2d');
        Text.Init(context);

        window.addEventListener('keydown', function(e) {
            if(e.repeat)
                return;
            for(var key of keys) {
                if(e.keyCode == key.key)
                    return;
            }

            keys.push({key: e.keyCode, handled: false});
        }, false);

        window.addEventListener('keyup', function(e) {
            for(var i = 0; i < keys.length; i++) {
                if(e.keyCode == keys[i].key) {
                    keys.splice(i, 1);
                }
            }
        }, false);

        Sprite('titleScreen', 'gruniozerca-colour.png');
        Sprite('menuScreen', 'bg-clouds.png');
        Sprite('grunio1', 'grunio1.png');
        Sprite('grunio2', 'grunio2.png');
        Sprite('dida1', 'dida1.png');
        Sprite('dida2', 'dida2.png');
        Sprite('credits', 'credits.png');
        Sprite('sleeping', 'sleeping.png');
        Sprite('gunter', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABACAYAAACNx/A2AAAFCUlEQVR4nO2aO28TQRDH56wIiQpZ0BhLCCV0saIgIdKccANYVBSBxk2+QqwoH4A6ilJT0iAkhESHwDQRLnBFFMUddmHJSRmlolyKZXxzk9nH3ToPzveXLOf29jH325nd2XMASpUqVapUqVJXo0gpla/lwYFuuLoazdCe/07ZAX76pBssLSVlwyHA+vpcgswGEOFRUZCSCu6hC8E9DIcaYrcLsLgo1VBFhugGuLOTeB0H1OsBxLF7lIODwkKsGO90Ogo6HQ0PwY1G+kPV69lHGA5D7Lv2snvg3bsJvGfP9He3m0CMYw2QQqJAfbzzP5e8iXQ6KgWPCjcNXPMeDQD+/NZlb2/rbwoO6xc0hM0AKQQephsb+vvsIcD9N/pvhDh4ma67tFRYeAC2NZAqjpMPAMC7d8m9sx/6++YDue3croGmHTaO9RrY7QI8BoDT7/pTfQpwo3Z+kym4zIk07sASxNEoWR/vvErKP28m9WmC3e0CbG8XMozNIby3px+Yrn+jkb4+Pk7KPm/qz61f6fbDYTp8aT5ZINnXQAqRguNeSa+lEMYUqIByn0QQIgA0+w21/yEDDJryFFR+uzBoeIe9gbmCabctMDwAT4DtcSsNz/e0QeEVdBNxvs5qj1vqy8dvAABwuqU0BNyh6WkFoWKagyooOJQVYHvcUpOTCRz2Bgk8KgSJIuvlvMi6iSA8qva4lUDrJOXv732dO3gAFg/koYvgJicTsX69VgeA+QNpBIi77kq87OyEeinW3187mguQIkBnysLEIdO24tpZIHn9JuLjhVxFB4fyygN9vPGwN5h+5gFes99QAIIH0l32dEtFGM4IEb2RQ/WF1uw31KzWx1n2lVfnPJCnLvtrR9HplooQEIWJ5SEehzMpKZUyBfaVVbwvfo1Zh3ENlKBcZmhiEg/3zPdt1z7K68HTFG+LeWAeI7IO7GMwwsvycFLS7xqD1vf13unE/lMKYFYjfISG8YGxLG+fHDCGlCRpnMnJxBpR9Vo9BRX754zEXRg7dq0DNrXHLcVDhE+O6ajI4VR3I0XvS2PhqUmygd/j3mcCzG2jdiCjCkC+xdcG1ycETd5HDW+PW6q6GynX2oueTeuhl0ppFY0EHhn4HNSjpehp9huquhupCq9MRcttpxO+tnF46CH0QUzehw9s8hz8m0Lm/TT7DVWv1UV4Un3aHxdOhEnTEKbu6ZILJt4zeTbPNbEMDW2PWwonj9/nHsq9D8fnEybVlzyrXqtDdTealuNYpuddkDpJDcbSCA4F61U/RurF6+fT8EAvoLBNQLH8sDcA7MO1maGXijZD+vgpeS5tK00I9sFflHC7UnkgvTl9iLXzD+57XPMBQeFhG5TknRyA6VqyBSWd7aUJMfVF21ekQslTpM6o0SvxshWY7Y0Nr8PzMx4hvC/TdbPfUBJ8SeilvI7rRUrFtkCiEVJnWC619317YzpXm/rIk6O64Ev1fCYb5f2zZh7xFxA2g6QHkyIhz6u1PPL1xHMATRVN3uLyCld/Vy361j1r+AIQgCFvoLPAcE2AyQ7fnxdClXUMYwiHnolt7X03gYsYe9YSd2FTWVbDriJMs47pU99WJ/Mm4hrwOqxtedfdPDBFgBcZvrPWRU2YL0zjG+kQw2xt865318GzJXmH8GV51XUFZVL05OdyIf/19rJ0oSeReVAJMFAlwECVAANVAgxUCTBQJcBAlQADVQIMVAkwUH8BtGu6j1uEG1wAAAAASUVORK5CYII=', true);
        Sprite('desert', 'bg-desert.png');
        Sprite('heart', 'heart.png');
        Sprite('carrot1', 'marchewka.png');
        Sprite('carrot2', 'pietruszka.png');
        Sprite('gameover', 'gameover.png');
        Sprite('grunioend1', 'grunioend.png');
        Sprite('grunioend2', 'grunioend2.png');
        Sprite('didaend1', 'go1a.png');
        Sprite('didaend2', 'go1b.png');

        Sound('menu', 'menu.wav', true);
        Sound('gameOver', 'gameover.wav');
        Sound('highScore', 'hiscore.wav');
    }

    var TitleScreen = {
        Start: function() {
            context.drawImage(sprites['titleScreen'], 0, 0);
            sounds['menu'].play();
        },

        Update: function() {
            for(var i = 0; i < keys.length; i++) {
                if(keys[i].handled)
                    continue;
                keys[i].handled = true;

                switch(keys[i].key) {
                    case controls.A:
                        SceneManager.LoadScene(MainMenu);
                        break;
                }
            }
        },

        Clean: function() {
            sounds['menu'].pause();
        }
    }

    var MainMenu = {
        Start: function() {
            sounds['menu'].play();

            this.clouds = 0;
            this.frameCount = 0;
            if(this.option == null)
                this.option = 1;
        },

        Update: function() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.drawImage(sprites['menuScreen'], this.clouds, 0);
            Text.Print('GRUNIOZERCA HTML', 8, 6);
            Text.Print('START GAME', 16, 18);
            Text.Print('CREDITS', 16, 30);
            Text.Print('QUIT', 16, 42);
            Text.Print('ARHN.EU 2018', 16, 54);

            if(this.option == 1)
                context.drawImage(sprites['grunio1'], 0, 15);
            else
                context.drawImage(sprites['grunio1'], 0, 13 * this.option);

            if(!(this.frameCount % 8))
                this.clouds--;
            if(this.clouds < -239)
                this.clouds = 0;

            for(var i = 0; i < keys.length; i++) {
                if(keys[i].handled)
                    continue;
                keys[i].handled = true;

                switch(keys[i].key) {
                    case controls.A:
                        switch(this.option) {
                            case 1:
                                SceneManager.LoadScene(Game);
                                break;

                            case 2:
                                SceneManager.LoadScene(Credits);
                                break;

                            case 3:
                                window.close();
                                break;
                        }
                        break;

                    case controls.UP:
                        this.option--;
                        break;

                    case controls.DOWN:
                        this.option++;
                        break;
                }

                if(this.option < 1)
                    this.option = 3;
                if(this.option > 3)
                    this.option = 1;
            }

            this.frameCount++;
            if(this.frameCount > fps)
                this.frameCount = 0;
        },

        Clean: function() {
            sounds['menu'].pause();
        }
    }

    var Credits = {
        Start: function() {
            sounds['menu'].play();
            this.frameCount = 1;
            this.credits = 0;
        },

        Update: function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(sprites['credits'], 0, 0);

            if(!(this.frameCount % 150))
                this.credits++;
            if(this.credits > 2)
                this.credits = 0;

            switch(this.credits) {
                case 0:
                    Text.PrintLn('  CODE:');
                    Text.PrintLn('    Dark Archon');
                    Text.PrintLn('      GRAPHICS:');
                    Text.PrintLn('        Neko');
                    Text.PrintLn('          CONCEPT:');
                    Text.PrintLn('            Dizzy9');
                    break;

                case 1:
                    Text.PrintLn('          MUSIC BY:');
                    Text.PrintLn('     Chip Jockey');
                    Text.PrintLn(' Ozzed.net');
                    Text.PrintLn('');
                    Text.PrintLn('    ARHN.EU 2018');
                    break;

                case 2:
                    Text.PrintLn(' Coded with support');
                    Text.PrintLn(' from the fantastic');
                    Text.PrintLn(' ARHN.EU community!');
                    Text.PrintLn('  --- YOU ROCK! ---');
                    break;
            }

            if(this.frameCount % 25 > 25 / 2)
                context.drawImage(sprites['sleeping'], 0, 0, 22, 11, 2, 52, 22, 11);
            else
                context.drawImage(sprites['sleeping'], 0, 11, 22, 11, 2, 52, 22, 11);

            for(var i = 0; i < keys.length; i++) {
                if(keys[i].handled)
                    continue;
                keys[i].handled = true;

                switch(keys[i].key) {
                    case controls.A:
                        SceneManager.LoadScene(MainMenu);
                        break;
                }
            }

            Text.Reset();

            this.frameCount++;
            if(this.frameCount > 1000000000)
                this.frameCount = 0;
        },

        Clean: function() {
            sounds['menu'].pause();
        }
    }

    var Game = {
        Carrot: {
            Start: function() {
                this.x = Math.floor(Math.random() * (canvas.width - 5 + 1));
                this.y = 8;
                this.width = 5;
                this.height = 11;
                this.altColor = Math.random() >= 0.5;
            },

            Update: function() {
                this.y++;
                if(Game.score >= 50)
                    this.y++;

                if(this.y > canvas.height - 11) {
                    Game.Grunio.life--;
                    this.Start();
                }

                if(IsColliding(this, Game.Grunio) && Game.Grunio.altColor == this.altColor) {
                    Game.score++;
                    this.Start();
                }
            },

            Render: function() {
                if(!this.altColor)
                    context.drawImage(sprites['carrot1'], this.x, this.y);
                else
                    context.drawImage(sprites['carrot2'], this.x, this.y);
            }
        },

        Grunio: {
            Start: function() {
                this.life = 3;
                this.x = 35;
                this.y = 50;
                this.width = 14;
                this.height = 10;
                this.flip = true;
                this.walking = false;
                this.altColor = false;
                this.acceleration = 0;
            },

            Update: function() {
                this.walking = false;

                for(var i = 0; i < keys.length; i++) {
                    switch(keys[i].key) {
                        case controls.LEFT:
                            if(this.flip != true) {
                                this.flip = true;
                                this.acceleration = 0;
                            }
                            this.walking = true;
                            this.acceleration++;

                            if(this.acceleration > 5)
                                this.x -= 2;
                            else
                                this.x--;

                            if(this.x < 0)
                                this.x = 0;
                            break;

                        case controls.RIGHT:
                            if(this.flip != false) {
                                this.flip = false;
                                this.acceleration = 0;
                            }
                            this.walking = true;
                            this.acceleration++;

                            if(this.acceleration > 5)
                                this.x += 2;
                            else
                                this.x++;

                            if(this.x > 80 - 14)
                                this.x = 80 - 14;
                            break;

                        case controls.A:
                            if(!keys[i].handled)
                                this.altColor = !this.altColor;
                    }
                    keys[i].handled = true;
                }
                if(!this.walking)
                    this.acceleration = 0;

                if(this.life < 1)
                    SceneManager.LoadScene(GameOver);
            },

            Render: function() {
                if(this.flip) {
                    context.save();
                    context.scale(-1, 1);

                    if((Game.frameCount % 2) && this.walking) {
                        if(!this.altColor)
                            context.drawImage(sprites['grunio1'], -this.x - 14, this.y, 14, 10);
                        else
                            context.drawImage(sprites['dida1'], -this.x - 14, this.y, 14, 10);
                    }
                    else {
                        if(!this.altColor)
                            context.drawImage(sprites['grunio2'], -this.x - 14, this.y, 14, 10);
                        else
                            context.drawImage(sprites['dida2'], -this.x - 14, this.y, 14, 10);
                    }

                    context.restore();
                }
                else {
                    if((Game.frameCount % 2) && this.walking) {
                        if(!this.altColor)
                            context.drawImage(sprites['grunio1'], this.x, this.y, 14, 10);
                        else
                            context.drawImage(sprites['dida1'], this.x, this.y, 14, 10);
                    }
                    else {
                        if(!this.altColor)
                            context.drawImage(sprites['grunio2'], this.x, this.y, 14, 10);
                        else
                            context.drawImage(sprites['dida2'], this.x, this.y, 14, 10);
                    }
                }
            }
        },

        Start: function() {
            this.clouds = 0;
            this.score = 0;
            this.frameCount = 1;

            this.Grunio.Start();
            this.Carrot.Start();
        },

        Update: function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(sprites['menuScreen'], this.clouds, 8);

            if(this.score < 50) {
                context.drawImage(sprites['gunter'], 0, 7);
            }
            else {
                context.drawImage(sprites['desert'], 0, 7);
            }
            context.fillStyle = "#000000";
            context.fillRect(0, 0, canvas.width, 7);

            for(var i = 0; i < Game.Grunio.life; i++)
                context.drawImage(sprites['heart'], 1 + (6 * i), 1);

            context.fillStyle = 'white';
            var score = this.score.toString();
            Text.Print(this.score.toString(), 74 - ((score.length - 1) * 4), 1);

            this.Grunio.Update();
            this.Carrot.Update();

            this.Grunio.Render();
            this.Carrot.Render();

            if(!(this.frameCount % 8))
                this.clouds--;
            if(this.clouds < -239)
                this.clouds = 0;

            this.frameCount++;
            if(this.frameCount > 1000000000)
                this.frameCount = 0;
        },

        Clean: function() {

        }
    }

    var GameOver = {
        Start: function() {
            this.frameCount = 1;
            this.newHighScore = false;

            if(typeof(Storage) !== "undefined") {
                this.highScore = localStorage.getItem("highScore");
                if(this.highScore == null)
                    this.highScore = 0;
                
                if(Game.score > this.highScore) {
                    localStorage.setItem("highScore", Game.score);
                    this.highScore = Game.score;
                    this.newHighScore = true;
                    sounds['highScore'].play();
                }
                else {
                    sounds['gameOver'].play();
                }
            }
        },

        Update: function() {
            for(var i = 0; i < keys.length; i++) {
                if(keys[i].handled)
                    continue;
                keys[i].handled = true;

                switch(keys[i].key) {
                    case controls.A:
                        SceneManager.LoadScene(Game);
                        break;
                }
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(sprites['gameover'], 0, 0);
            if((this.frameCount % 20) > 20 / 2)
                context.drawImage(sprites['grunioend1'], 11, 49);
            else
                context.drawImage(sprites['grunioend2'], 11, 49);
            context.save();
            context.scale(-1, 1);
            if((this.frameCount % 20) < 20 / 2)
                context.drawImage(sprites['didaend1'], -56 - Game.Grunio.width, 49, Game.Grunio.width, Game.Grunio.height);
            else
                context.drawImage(sprites['didaend2'], -56 - Game.Grunio.width, 49, Game.Grunio.width, Game.Grunio.height);
            context.restore();

            context.fillStyle = 'white';
            Text.PrintLn('  YOUR SCORE: ' + Game.score.toString());
            Text.PrintLn('  TOP SCORE:  ' + this.highScore.toString());
            Text.PrintLn('');
            context.fillStyle = 'red';
            if(this.newHighScore)
                Text.PrintLn(' ! NEW HIGH SCORE !');
            Text.Reset();

            this.frameCount++;
            if(this.frameCount > 1000000000)
                this.frameCount = 0;
        },

        Clean: function() {
            sounds['highScore'].pause();
            sounds['gameOver'].pause();
        }
    }

    window.onload = async function() {
        Init();
        while(spritesToLoad != 0) {
            await sleep(100);
        }
        SceneManager.LoadScene(TitleScreen);

        setInterval(SceneManager.UpdateScene, 1000 / fps);
    }

})();