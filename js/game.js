define([
    'lib/phaser',
    'js/levels',
    'js/util'
],
function (phaser, LevelManager, util) {
    var jumpButton = phaser.Keyboard.SPACEBAR,
        pauseButton = phaser.Keyboard.P,
        domLevel = document.getElementById('level'),
        domDeaths = document.getElementById('deaths'),
        levels = new LevelManager(),
        game = new phaser.Game(levels.constants.width, levels.constants.height,
                                phaser.AUTO, 'ninjacy')

    function loading() {}
    function running() { this.pause = true, this.deaths = 0 }

    loading.prototype.preload = function () {
        game.load.image('box', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA'+
                        'ABQAAAAUAQAAAACl8iCgAAAADklEQVR4AWP8z/CRmhgAEwom1XWUb'+
                        '+EAAAAASUVORK5CYII=')
        game.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU'+
                        'gAAAfQAAAACAQAAAACGEROXAAAAEElEQVQImWP4TxH4wEChfgBe83'+
                        '1l4TdA5wAAAABJRU5ErkJggg==')
    }

    loading.prototype.create = function () { game.state.start('running') }

    running.prototype.create = function () {
        this.spacebar = game.input.keyboard.addKey(jumpButton)
        game.input.keyboard.addKeyCapture(jumpButton)

        this.pausekey = game.input.keyboard.addKey(pauseButton)
        game.input.keyboard.addKeyCapture(pauseButton)
        this.pausekey.onDown.add(this.stop, this)

        this.levelUp()
    }

    running.prototype.update = function () {
        game.physics.collide(this.player, this.level.ground)

        // TODO: More events to entities
        var jumping = this.spacebar.isDown,
            landed = this.level.player.body.touching.down,
            done = this.level.player.x >= levels.constants.end

        if (landed) {
            if (jumping) {
                if (this.pause) this.start()
                this.jump()
            }
            this.pause || this.run()
        }

        if (done) this.reset(), this.levelUp()
        else game.physics.overlap(this.level.player, this.level.blocks,
                                  this.crashed, 0, this)

        util.moveRotate2dObj(this.level.player3d, this.level.player)
        util.cameraTrack2dObj(game._goo.cam, this.level.player)
    }

    running.prototype.start = function () {
        this.pause = false
    }

    running.prototype.stop = function () {
        this.pause = true
        this.reset()
    }

    running.prototype.run = function () {
        this.player.body.velocity.x = 170
    }

    running.prototype.jump = function () {
        this.player.body.velocity.y = -250
        this.barrelRoll = game.add.tween(this.player)
        this.barrelRoll.to({ angle: this.player.angle + 180 }, 700, 0, 1)
    }

    running.prototype.reset = function () {
        this.player.reset(levels.constants.pad, levels.constants.drop)
        this.barrelRoll.pause().stop()
        this.player.angle = 0
    }

    running.prototype.levelUp = function () {
        this.level = levels.nextLevel(game)
        this.player = this.level.player
        domLevel.innerHTML = this.level.name
    }

    running.prototype.crashed = function () {
        this.reset()
        domDeaths.innerHTML = ++this.deaths
    }

    game.state.add('loading', loading)
    game.state.add('running', running)

    return game
})
