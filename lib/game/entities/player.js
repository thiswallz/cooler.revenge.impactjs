ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity',
	'plugins.color-picker'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
	size: {x: 36, y: 40},
	offset: {x: 0, y: 0},
	maxVel: {x: 700, y: 700},
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE, // Collision is already handled by Box2D!
	
	starPosition: null,
	health: 100,

	friction: {x: 0, y: 0},

	animSheet: new ig.AnimationSheet( 'media/cooler_basic.png', 36, 40 ),
	img: new ig.Image( 'media/cooler_avatar.png' ),	
	imgLife: new ig.Image( 'media/life.png' ),
	imgContLife: new ig.Image( 'media/contlife.png' ),		
	font: new ig.Font( 'media/04b03.font.png' ),
	
	flip: false,
	accelGround: 200,
	accelAir: 150,
	jump: 300,
	semFall: 0,
	semUp: 0,
	player: true,
	lifePlayer:  '',
	maxBarLife: 56,
	deathtime: 0.7,
	chargertime: 0.7,
	isChargerOut: false,

	inAir: false,

	memorizeAction: null,

	shootSFX: new ig.Sound('media/sounds/burning_fire.*',false),

	chargerSFX: new ig.Sound('media/sounds/mase_charge.*', false),

	

	draw: function(v) {
		// Draw all entities and BackgroundMaps
		this.parent();
		
		if( !ig.ua.mobile ) {
			//this.font.draw( 'Arrow Keys, X, C', 2, 2 );
		}
		this.img.draw( 2, 2 );

		//this.font.draw( this.lifePlayer, 2, 70 );
		var clife = (this.maxBarLife*this.health)/100;

		//health
		for(var i=0;i<=clife;i++){
			this.imgLife.drawTile( 5, (120-i), 0, 6, 1);
		}
		this.imgContLife.draw(0, 59)
	},
	kill: function(){
		this.parent();
		var x = this.starPosition.x;
		var y = this.starPosition.y;

		ig.game.spawnEntity(EntityPlayer, x, y)

	},
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 1, [5] );
		this.addAnim( 'fall', 1, [4] );
		this.addAnim( 'shoot', 1, [6] );
		this.addAnim( 'charger', 1, [7] );
		this.addAnim( 'caminar', 0.1, [1,2,2,0] );
		this.addAnim( 'mCaminar', 0.01, [2] );

		this.starPosition = this.pos;

		ig.game.player = this;
	},
	update: function() {

		if(this.memorizeAction == 'shoot' && !ig.input.state('shoot') && this.isChargerOut == false){
			var x = this.pos.x + (this.flip ? -12 : 28 );
			var y = this.pos.y + 9;
			ig.game.spawnEntity( EntityProjectileCharger, x, y, {flip:this.flip} );
			this.isChargerOut = true;
			this.chargerTimer = null;
			this.chargerSFX.stop();
			this.shootSFX.play();
		}
		var accel = this.standing ? this.accelGround : this.accelAir;
		//jump
		this._onJumpPlayer()

		// shoot
		if( ig.input.pressed('shoot')) {
			var x = this.pos.x + (this.flip ? -4 : 22 );
			var y = this.pos.y + 12;
			ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
			this.chargerTimer = new ig.Timer();
			this.isChargerOut = true;
			this.shootSFX.play();
		}



		// set the current animation, based on the player's speed
		if( ig.input.state('left') ) {
			this.vel.x = -accel;
			this.currentAnim = this.anims.caminar;
			this.flip = true;
			this._chargeKill();
			this.memorizeAction = 'left';
		}
		else if( ig.input.state('right') ) {
			this.vel.x = accel;
			this.currentAnim = this.anims.caminar;
			this.flip = false;
			this._chargeKill();
			this.memorizeAction = 'right';
		}
		else if(ig.input.state('shoot')){
			this.currentAnim = this.anims.shoot.rewind();
			this.vel.x = 0;
			if(this.chargerTimer ){
				if(this.chargerTimer.delta() > this.chargertime){
					this.currentAnim = this.anims.charger.rewind();
					var x = this.pos.x + (this.flip ? -12 : 28 );
					var y = this.pos.y + 9;
					if(!this.chargerEntity && this.inAir == false){
						this.chargerSFX.play();
						this.chargerEntity = ig.game.spawnEntity( EntityCharger, x, y, {flip:this.flip, vel: {x: 0}} );
					}

				}
			}
			this.memorizeAction = 'shoot';
		}
		else if(this.vel.y == 0 && this.vel.x == 0) {
			this.currentAnim = this.anims.idle;
			this._chargerOff();
		}else{
			this.vel.x = 0;
			this._chargerOff();
		}
		//if(this.chargerTimer)
			//console.log(this.chargerTimer.delta())



		this.currentAnim.flip.x = this.flip;
		
		
		// move!
		this.parent();
	},
	_onJumpPlayer: function(){
		var accel = this.standing ? this.accelGround : this.accelAir;
		this.inAir = false;
		if(this.standing && ig.input.pressed('jump')) {
			this.vel.y = -this.jump + ((accel * -1) / 10);

		}
		//position jump			
		if(this._isFall()==1){
			this.currentAnim = this.anims.fall;
			this.inAir = true;
			this._chargeKill();
		}else if(this._isUp() == 1){
			this.currentAnim = this.anims.jump;
			this.inAir = true;
			this._chargeKill();
		}else{
			if(ig.input.state('jump')){
				this.currentAnim = this.anims.jump;
				this._chargeKill();
				this.inAir = true;
			}
		}
	},
	_chargeKill: function(){
		if(this.chargerEntity){
			this.chargerEntity.kill();
			this.chargerEntity = null;
		}
		this.chargerSFX.stop();
	},
	_chargerOff: function(){
		if(this.chargerEntity){
			this.chargerEntity.kill();
			this.chargerEntity = null;
			this.isChargerOut = false;
		}
		this.chargerTimer = null;
		this.chargerSFX.stop();
		
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

EntityCharger = ig.Entity.extend({
	size: {x: 19, y: 17},
	offset: {x: 0, y: 0},
	maxVel: {x: 300, y: 200},

	gravityFactor: 0,

	bounciness: 0.3, 

	flip: false,
	
	type: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/charger.png', 19, 17 ),

	bounceCounter: 0,	
	update: function() {
		this.currentAnim = this.anims.charging;
		// move!
		this.parent();
	},
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		//this.vel.y = -50;
		this.addAnim( 'idle', 1, [3] );
		this.addAnim( 'charging', 0.03, [0,1,2,2,1] );

		this.currentAnim.flip.x = settings.flip;
	},
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.kill();
		}
	},
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}
});

EntityProjectileCharger = ig.Entity.extend({
	size: {x: 19, y: 17},
	offset: {x: 0, y: 0},
	maxVel: {x: 300, y: 200},

	gravityFactor: 0,

	bounciness: 0.3, 

	flip: false,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/charger.png', 19, 17 ),

	bounceCounter: 0,	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
		//this.vel.y = -50;
		this.addAnim( 'idle', 1, [0,1,2,2,1] );

		this.currentAnim.flip.x = settings.flip;
	},
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.kill();
		}
	},
	check: function( other ) {
		other.receiveDamage( 50, this );
		this.kill();
	}
});

EntityProjectile = ig.Entity.extend({
	size: {x: 16, y: 12},
	offset: {x: 1, y: 1},
	maxVel: {x: 300, y: 200},

	gravityFactor: 0,

	bounciness: 0.3, 

	flip: false,
	
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

		this.currentAnim.flip.x = settings.flip;

		

	},
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.kill();
		}
	},
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}
});



 EntityParticle = ig.Entity.extend({
	// single pixel sprites
	size: { x:1, y:1 },

	// Initialize ColorPicker
	picker: new ColorPicker,

	// particle will collide but not effect other entities
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.LITE,

	// default particle lifetime & fadetime
	lifetime: 5,
	fadetime: 1,
	alpha: 255,

	// particles will bounce off other entities when it collides
	minBounceVelocity: 0,
	bounciness: 1.0,
	friction: { x:0, y:0 },

	init:function( x, y, settings ){
	    this.parent( x, y, settings );

	    // take velocity and add randomness to vel
	    var vx = this.vel.x;
	    var vy = this.vel.y;
	    this.vel.x = (Math.random()*2-1)*vx;
	    this.vel.y = (Math.random()*2-1)*vy;

	    // init timer for fadetime
	    this.idleTimer = new ig.Timer();
	},

    update: function() {
	    // check if particle has exsisted past lifetime
	    // if so, remove particle
	    if(this.idleTimer.delta() > this.lifetime){
			this.kill();
			return;
	    }

	    // fade the particle effect using the aplha blend
	    this.alpha = this.idleTimer.delta().map( this.lifetime - this.fadetime, this.lifetime, 1, 0 );

	    this.parent();
	},

	draw: function() {
	    var ctx = ig.system.context;
	    var s = ig.system.scale;
	    var x = this.pos.x * s - ig.game.screen.x * s;
	    var y = this.pos.y * s - ig.game.screen.y * s;
	    var id = ctx.createImageData( 1, 1 );
	    var rgba = this.picker.hexToRGBA( this.picker.colors[parseInt(Math.random()*100-1)] );
	    var d  = id.data;
	    d[0] = rgba[0];
	    d[1] = rgba[1];
	    d[2] = rgba[2];
	    if (this.alpha > 1) {
		d[3] = rgba[3];
	    } else {
		d[3] = rgba[3] * this.alpha;
	    }
	    ctx.putImageData( id, x, y );
	    ctx.restore();
	}

    });
    
    FireGib = EntityParticle.extend({
	// shorter lifetime
    lifetime: 0.3,
    fadetime: 0.15,
	// velocity value to be set
    vel: null,
	maxVel: {x: 500, y: 500},
	gravityFactor: 0,
	// bounce a little less
	bounciness: 0.6,
        init:function( x, y, settings ){
	    // update random velocity to create starburst effect
	    this.vel = { x: (Math.random() < 0.5 ? -1 : 1)*Math.random()*200,
			 y: (Math.random() < 0.5 ? -1 : 1)*Math.random()*200 };

	    // send to parent
	    this.parent( x, y, settings );

	    // generate color gradient for FireGib
	    this.picker.colors = this.picker.genMultiHexArray( [0xDF0101, 0x8A0808, 0xFE2E2E], 90);
	}
    });
    
    BlueFireGib = EntityParticle.extend({
	// shorter lifetime
        lifetime: 0.3,
        fadetime: 0.15,

	// velocity value to be set
        vel: null,

	gravityFactor: 0,

	// bounce a little less
	bounciness: 0.6,

        init:function( x, y, settings ){
	    // update random velocity to create starburst effect
	    this.vel = { x: (Math.random() < 0.5 ? -1 : 1)*Math.random()*100,
			 y: (Math.random() < 0.5 ? -1 : 1)*Math.random()*100 };

	    // send to parent
	    this.parent( x, y, settings );

	    // generate color gradient for BlueFireGib
	    this.picker.colors = this.picker.genHexArray( 0xFFFFFF, 0x0000FF, 100 );
	}
    });



});