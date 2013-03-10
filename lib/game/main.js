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
			this.screen.x = player.pos.x - ig.system.width/3;
			this.screen.y = player.pos.y - ig.system.height/1.7;
		}
	},
	
	draw: function() {
		// Draw all entities and BackgroundMaps
		this.parent();
		
		if( !ig.ua.mobile ) {
			//this.font.draw( 'Arrow Keys, X, C', 2, 2 );
		}

	}
});

ScreenStart = ig.Game.extend({
	
	gravity: 600, // All entities are affected by this

	background: new ig.Image('media/init.png'),
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	clearColor: '#000',
	
	init: function() {

		
		if( ig.ua.mobile ) {
			ig.input.bindTouch( '#buttonShoot', 'start' );
		}else{
			ig.input.bind( ig.KEY.SPACE, 'start' );
		}
		
		// Load the LevelTest as required above ('game.level.test')

	},
	
	loadLevel: function( data ) {
		this.parent( data );
		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			this.backgroundMaps[i].preRender = true;
		}
	},
	
	update: function() {		
		if( ig.input.pressed('start') ) {
			ig.system.setGame(MyGame)
		}
		// Update all entities and BackgroundMaps
		this.parent();

	},
	
	draw: function() {
		// Draw all entities and BackgroundMaps
		this.parent();
		this.background.draw(0, 0);
		var x= ig.system.width/2,
		y = ig.system.height - 270;

		this.font.draw("Press SpaceBar To Start", x+140, y, ig.Font.ALIGN.CENTER);
		
		if( !ig.ua.mobile ) {
			this.font.draw( 'Arrow Keys, X, C', 2, 2 );
		}

	}
});

if( ig.ua.iPad ) {
	ig.Sound.enabled = false;
	ig.main('#canvas', ScreenStart, 60, 240, 160, 2);
}
else if( ig.ua.mobile ) {	
	console.log("mobile")
	ig.Sound.enabled = false;
	var width = 420;
	var height = 270;
	ig.main('#canvas', ScreenStart, 60, 420, 270, 1);
	
	var c = ig.$('#canvas');
	c.width = width;
	c.height = height;
	
	var pr = 2;//ig.ua.pixelRatio;
	if( pr != 1 ) {
		//~ c.style.width = (width / pr) + 'px';
		//~ c.style.height = (height / pr) + 'px';
		c.style.webkitTransformOrigin = 'center top';
		c.style.webkitTransform = 
			//~ 'translate3d('+(width / (4 * pr))+'px, '+(height / (4 * pr))+'px, 0)' + 
			//~ 'scale3d('+pr+', '+pr+', 0)' +
			'scale3d(1,1, 0)' +
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
	ig.main('#canvas', ScreenStart, 60, 420, 270, 2);
}

});

