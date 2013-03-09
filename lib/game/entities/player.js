ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
	size: {x: 36, y: 40},
	offset: {x: 1, y: 1},
	maxVel: {x: 700, y: 700},
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE, // Collision is already handled by Box2D!
	
	health: 10,

	friction: {x: 0, y: 0},

	animSheet: new ig.AnimationSheet( 'media/cooler_basic.png', 36, 40 ),	
	
	flip: false,
	accelGround: 200,
	accelAir: 150,
	jump: 300,
	semFall: 0,
	semUp: 0,

	player: true,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 1, [5] );
		this.addAnim( 'fall', 1, [4] );
		this.addAnim( 'shoot', 1, [6] );
		this.addAnim( 'caminar', 0.1, [1,2,2,1] );
		this.addAnim( 'mCaminar', 0.01, [2] );

		ig.game.player = this;
	},
	update: function() {
		//control de salto
		var accel = this.standing ? this.accelGround : this.accelAir;


		// move left or right
		if( ig.input.state('left') ) {
			this.vel.x = -accel;
			this.currentAnim = this.anims.caminar;
			this.flip = true;
		}
		else if( ig.input.state('right') ) {
			this.vel.x = accel;
			this.currentAnim = this.anims.caminar;
			this.flip = false;
		}
		else {
			this.vel.x = 0;
		}

		//jump
		if(this.standing && ig.input.pressed('jump')) {
			this.vel.y = -this.jump + ((accel * -1) / 10);
		}
		//position jump			
		if(this._isFall()==1){
			this.currentAnim = this.anims.fall;
		}else if(this._isUp() == 1){
			this.currentAnim = this.anims.jump;
		}else{
			if(ig.input.state('jump')){
				this.currentAnim = this.anims.jump;
			}
		}
		//shooter


		// shoot
		if( ig.input.pressed('shoot') ) {
			var x = this.pos.x + (this.flip ? -4 : 22 );
			var y = this.pos.y + 12;
			ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
		}
		
		// set the current animation, based on the player's speed
		if(ig.input.state('shoot')){
			this.currentAnim = this.anims.shoot.rewind();
		}
		else if(this.vel.y == 0 && this.vel.x == 0) {
			this.currentAnim = this.anims.idle;
		}

		this.currentAnim.flip.x = this.flip;
		
		
		// move!
		this.parent();
	},
	_isFall: function(){
		var r = 0;
		//console.log(this.semFall, this.pos.y)


		if(this.pos.y>this.semFall){
			r = 1;
		}else{
			r = 0;
		}
		this.semFall = this.pos.y;

		return r;
	},
	_isUp: function(){
		var r = 0;
		//console.log(this.semFall, this.pos.y)


		if(this.pos.y<this.semUp){
			r = 1;
		}else{
			r = 0;
		}
		this.semUp = this.pos.y;

		return r;
	}
});


EntityProjectile = ig.Entity.extend({
	size: {x: 16, y: 12},
	offset: {x: 1, y: 1},
	maxVel: {x: 300, y: 200},

	gravityFactor: 0,

	bounciness: 0.3, 
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/poder_amarillo.png', 16, 12 ),

	bounceCounter: 0,	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
		//this.vel.y = -50;
		this.addAnim( 'idle', 1, [3] );
	},
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.kill();
			// only bounce 3 times, for granades example
			/*
			this.bounceCounter++;
			if( this.bounceCounter > 3 ) {
				this.kill();
			}*/
		}
	},
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}
});

});