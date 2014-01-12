define([
    'js/maps',
    'js/util'
],
function (maps, util) {

    var constants = maps.constants
    constants.end = constants.width - constants.pad

    function LevelManager() {}
    function Level(game, name, data) {
        if (!this.ground) {
            Level.prototype.ground = game.add.sprite(0.5 * constants.width,
                                        constants.bottom, 'ground')
            this.ground.anchor.setTo(0.5, 0.5)
            this.ground.body.immovable = true
        }

        if (!this.player) {
            Level.prototype.player = game.add.sprite(constants.pad,
                                            constants.drop, 'box')
            this.player.body.gravity.setTo(0, 12)
        }

        if (!this.blocks)
            Level.prototype.blocks = game.add.group()

        if (!this.ground3d)
            Level.prototype.ground3d = util.gooBoxFrom2dObj(this.ground, 2)
        if (!this.player3d)
            Level.prototype.player3d = util.gooBoxFrom2dObj(this.player, 2, [0.8, 1, 0.4, 1])

        this.name = name
        this.init(game, data)
    }

    LevelManager.prototype.constants = constants
    LevelManager.prototype.level = null
    LevelManager.prototype.current = 0
    LevelManager.prototype.nextLevel = function (game) {
        if (this.level)
            this.level.end()
        this.level = new Level(game, ++this.current, maps.maps[this.current])

        return this.level
    }

    Level.prototype.blocks = null
    Level.prototype.ground = null
    Level.prototype.player = null
    Level.prototype.ground3d = null
    Level.prototype.player3d = null
    Level.prototype.blocks3d = []
    Level.prototype.init = function (game, data) {
        this.player.reset(constants.pad, constants.drop)
        this.player.anchor.setTo(0.5, 0.5)
        this.load(data)
    }

    Level.prototype.newBlock = function (tile) {
        if (util.isNumber(tile))
            return {
                type: 0,
                asc: 0,
                h: -0.1 * tile * tile + tile - 0.6 // WTF?
            }
        if (!util.isHash(tile))
            throw new Error("Bad object passed in level " + name)

        // TODO: more different actions
        // Actually, this must be folder named units with 9000 files in it
        // And many-many inheritance within, and base class must have method
        // getPhysics, or like, which will return physical object, adn render
        // manager make render objec from this physical definitions, or
        // something such. There a lot ways to do this, using mad OOP.

        return {
            type: tile['type'] || 0,
            asc: tile['asc'] || 0,
            h: tile['height'] || 0.3,
        }
    }

    Level.prototype.load = function (data) {
        data.forEach(function (tile, n) { if (tile) {
            var b = this.blocks.getFirstDead()
            var block = this.newBlock(tile)
            if (!b)
                b = this.blocks.create(0, 0, 'box')
            b.reset(n * b.width + 100, constants.bottom - block.asc - 1)
            b.anchor.setTo(0, 1)
            b.scale.setTo(1, block.h)
            this.blocks3d.push(util.gooBoxFrom2dObjB(b, 2))
        }}, this)
    }

    Level.prototype.end = function () {
        this.blocks.forEachAlive(function (b) { b.kill() })
        this.blocks3d.forEach(function (b) { b.removeFromWorld() })
        this.blocks3d = []
    }


    return LevelManager

})