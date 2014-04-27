
'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
	this.load.spritesheet('drilling', 'assets/drilling.png', 16, 28);
    this.load.spritesheet('dirt', 'assets/tileset_dirt.png', 32, 32);
    this.load.image('coin', 'assets/coin.png');
    this.load.spritesheet('gems', 'assets/gems.png', 15, 13);
    this.load.spritesheet('particles-dirt', 'assets/particles_dirt.png', 4, 4);
	this.load.spritesheet('drilldirt', 'assets/drilldirt.png', 24, 16);
	this.load.spritesheet('particles-tunnel', 'assets/particles_tunnel.png', 6, 6);
	this.load.image('particles-tunnel-solid', 'assets/particles_tunnel_solid.png');
	this.load.image('particles-get', 'assets/particles_get.png');
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('play');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;