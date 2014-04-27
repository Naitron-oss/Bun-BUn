'use strict';

// static variables

var GEM_FREQUENCY = 2; // per block

var Bunny = require('../prefabs/bunny');
var Block = require('../prefabs/block');
var Gem = require('../prefabs/gem');

/**
 * @author Steve Richey http://www.steverichey.com @stvr_tweets
 */
 
function Play() {}

Play.prototype = {
	create: function() {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.game.stage.backgroundColor = '#000';
		
		// initialize game variables
		this.cash = 0;
		
		this.chunkGroup = this.game.add.group();
		this.nextChunkY = 0;
		this.game.world.bounds.height = 1024;
		this.game.camera.setBoundsToWorld();
		this.lastChunkIndex = 0;
		this.gems = this.game.add.group();
		this.generateChunk();
		this.generateChunk();
		
		// create the dirt emitter
		
		this.dirtEmitter = this.game.add.emitter(32, 64, 500);
		this.dirtEmitter.makeParticles('particles-dirt', [0,1,2,3], 500, false, false);
		this.dirtEmitter.setYSpeed(-5, 200);
		this.dirtEmitter.setRotation(0, 0);
		this.dirtEmitter.start(false, 500, 25);
		
		// create the dirt effect
		
		this.drilldirt = this.game.add.sprite(32, 64, 'drilldirt');
		this.drilldirt.smoothed = false;
		this.drilldirt.scale.x = 2;
		this.drilldirt.scale.y = 2;
		this.drilldirt.anchor.setTo(0.5, -0.1);
		this.drilldirt.animations.add('drill', [0,1,2], 16, true);
		this.drilldirt.animations.play('drill');
		
		// create the tunnel
		
		this.tunnel = this.game.add.emitter(32, 64, 100);
		this.tunnel.makeParticles('particles-tunnel-solid', 0, 100, false, false);
		this.tunnel.setXSpeed(0,0);
		this.tunnel.setYSpeed(0,0);
		this.tunnel.gravity = 0;//
		this.tunnel.start(false, 750, 25);
		
		// create the tunnel border
		
		this.tunnelborder = this.game.add.emitter(32, 64, 200);
		this.tunnelborder.makeParticles('particles-tunnel', [0,1,2], 200, false, false);
		this.tunnelborder.setXSpeed(0, 0);
		this.tunnelborder.setYSpeed(0, 0);
		this.tunnelborder.setRotation(0, 0);
		this.tunnelborder.gravity = 0;
		this.tunnelborder.start(false, 750, 15);
		
		// create the player
		this.bunny = new Bunny(this.game, 32, 64);
		this.game.add.existing(this.bunny);
		
		// pickup effect
		this.getEmitter = this.game.add.emitter();
		this.getEmitter.makeParticles('particles-get');
		this.getEmitter.gravity = 0;
		this.getEmitter.setAlpha(0, 1);
		this.getEmitter.setXSpeed(-25, 25);
		this.getEmitter.setYSpeed(-25, 25);
		this.getEmitter.bounce.set(0.5, 0.5);
		
		// follow the bunny!
		this.game.camera.follow(this.bunny);
		this.game.camera.deadzone = new Phaser.Rectangle(0, 0, 320, 128);
	},
	update: function() {
		// collect gems
		this.game.physics.arcade.overlap(this.bunny, this.gems, this.collectGems, null, this);
		
		// generate a new chunk if we're about to run out
		
		if (this.bunny.y > this.chunkGroup.children[this.chunkGroup.children.length - 1].y)
		{
			this.generateChunk();
		}
		
		// garbage collect old chunks
		
		var i = this.chunkGroup.children.length;
		
		while (i >= 0)
		{
			if (this.chunkGroup.children[i])
			{
				if (this.chunkGroup.children[i].y < this.game.camera.y - 8 * 64)
				{
					this.chunkGroup.remove(this.chunkGroup.children[i], false);
				}
			}
			
			i--;
		}
		
		// update dirt particle position
		
		this.dirtEmitter.emitX = this.bunny.x;
		this.dirtEmitter.emitY = this.bunny.y + 24;
		
		// update drill dirt effect position/angle
		
		this.drilldirt.x = this.bunny.x;
		this.drilldirt.y = this.bunny.y;
		this.drilldirt.angle = this.bunny.angle;
		
		// update tunnel position/angle
		
		this.tunnel.emitX = this.bunny.x;
		this.tunnel.emitY = this.bunny.y;
		this.tunnel.setRotation(this.bunny.angle, this.bunny.angle);
		
		// update the tunnel border
		
		this.tunnelborder.emitX = this.game.rnd.pick(
			[	this.bunny.x - this.bunny.width / 2 + 1, 
				this.bunny.x - this.bunny.width / 2 + 2,
				this.bunny.x - this.bunny.width / 2 + 3,
				this.bunny.x + this.bunny.width / 2 - 1,
				this.bunny.x + this.bunny.width / 2 - 2,
				this.bunny.x + this.bunny.width / 2 - 3 ]);
		this.tunnelborder.emitY = this.bunny.y;
	},
	render: function() {
		//this.game.debug.text('Bunny angle: ' + this.bunny.angle, 32, 32, 'rgb(0,0,0)');
		this.game.debug.text('DEPTH: ' + Math.round(this.bunny.y), 8, 16, 'rgb(255,255,255)');
		this.game.debug.text('CASH: $' + this.cash, 8, 32);
		this.game.debug.text('CHUNKS: ' + this.chunkGroup.children.length, 8, this.game.height - 12, 'rgb(0,0,0)');
		//this.game.debug.body(this.bunny);
		//this.game.debug.bodyInfo(this.bunny, 16, 32);
	},
	generateChunk: function() {
		var newChunk = this.chunkGroup.add(this.game.add.group());
		this.lastChunkIndex = this.chunkGroup.getIndex(newChunk);
		newChunk.y = this.nextChunkY;
		
		var xPos = 0;
		var yPos = 0;
		
		for (var i = 0; i < 5 * 8; i++)
		{
			newChunk.add(new Block(this.game, xPos, yPos));
			xPos += 64;
			
			if (xPos >= this.game.width)
			{
				xPos = 0;
				yPos += 64;
			}
		}
		
		for (i = 0; i < GEM_FREQUENCY; i++)
		{
			this.gems.add(new Gem(	this.game,
									this.game.rnd.integerInRange(0, 64*5),
									this.game.rnd.integerInRange(this.nextChunkY, this.nextChunkY+64*8)));
		}
		
		this.nextChunkY += 64 * 8;
		
		this.game.world.bounds.y = newChunk.y - 8 * 64;
		this.game.camera.bounds.height += 64 * 8;
		this.game.physics.arcade.setBoundsToWorld();
	},
	collectGems: function(player, gem) {
		this.getEmitter.emitX = gem.x;
		this.getEmitter.emitY = gem.y;
		this.cash += gem.frame + 1;
		this.gems.remove(gem, true);
		this.getEmitter.start(true, 1000, null, 25);
	}
};

module.exports = Play;