ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',
	'game.entities.crate',
	'game.levels.lvl1',
	
	'plugins.box2d.game'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({
	
	gravity: 600, // All entities are affected by this
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	clearColor: '#000',
	
	init: function() {
		// Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.X, 'jump' );
		ig.input.bind( ig.KEY.C, 'shoot' );
		
		if( ig.ua.mobile ) {
			ig.input.bindTouch( '#buttonLeft', 'left' );
			ig.input.bindTouch( '#buttonRight', 'right' );
			ig.input.bindTouch( '#buttonShoot', 'shoot' );
			ig.input.bindTouch( '#buttonJump', 'jump' );
		}
		
		// Load the LevelTest as required above ('game.level.test')
		this.loadLevel( LevelLvl1);
	},
	
	loadLevel: function( data ) {
		this.parent( data );
		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			this.backgroundMaps[i].preRender = true;
		}
	},
	
	update: function() {		
		// Update all entities and BackgroundMaps
		this.parent();
		
		// screen follows the player
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2;
			this.screen.y = player.pos.y - ig.system.height/2;
		}
	},
	
	draw: function() {
		// Draw all entities and BackgroundMaps
		this.parent();
		
		if( !ig.ua.mobile ) {
			this.font.draw( 'Arrow Keys, X, C', 2, 2 );
		}
	}
});


if( ig.ua.iPad ) {
	ig.Sound.enabled = false;
	ig.main('#canvas', MyGame, 60, 240, 160, 2);
}
else if( ig.ua.mobile ) {	
	ig.Sound.enabled = false;
	var width = 320;
	var height = 320;
	ig.main('#canvas', MyGame, 60, 160, 160, 1);
	
	var c = ig.$('#canvas');
	c.width = width;
	c.height = height;
	
	var pr = 2;//ig.ua.pixelRatio;
	if( pr != 1 ) {
		//~ c.style.width = (width / pr) + 'px';
		//~ c.style.height = (height / pr) + 'px';
		c.style.webkitTransformOrigin = 'left top';
		c.style.webkitTransform = 
			//~ 'translate3d('+(width / (4 * pr))+'px, '+(height / (4 * pr))+'px, 0)' + 
			//~ 'scale3d('+pr+', '+pr+', 0)' +
			'scale3d(2,2, 0)' +
			'';
	}
	//~ ig.system.canvas.style.width = '320px';
	//~ ig.system.canvas.style.height = '320px';
	//~ ig.$('#body').style.height = '800px';
	
	    //~ 320
	 //~ 80 480  80 // div 320/1.5 = 213
	//~ 160 640 160 // div 320/2 = 160
	
	
}
else {
	ig.main('#canvas', MyGame, 60, 520, 340, 2);
}

});
