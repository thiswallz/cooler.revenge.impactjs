ig.module(
	'game.entities.turtles'
)
.requires(
	'impact.entity',
	'game.entities.player'
)
.defines(function(){

	EntityTurtles = ig.Entity.extend({
		size: {x: 36, y: 46},
		offset: {x: 0, y: 0},
		maxVel: {x: 400, y: 400},
		flip: false,
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,

		health: 80,

		friction: {x: 150, y: 0},
		speed: 40,

		lifetime: 2,
		fadetime: 1,

		shoottime: 0.5,

		animSheet: new ig.AnimationSheet( 'media/enemy_1.png', 36, 46 ),	
		
		kill: function(){
			this.parent();

			for (var i = 0; i <= 50; i++){
                ig.game.spawnEntity( BlueFireGib, this.pos.x+9, this.pos.y+20 );
			}
		},

		receiveDamage: function(value){
			this.parent(value)
			/*
			if(this.health > 0){
				ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 24,colorOffset: 1});
			}*/
			// Spawn FireGibs
			var randPos = {x: Math.random()*45 + 1, y: Math.random()*23 + 2};
			for (var i = 0; i <= 7; i++){
                ig.game.spawnEntity( FireGib, this.pos.x+9, this.pos.y+20 );
			}
		},
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim( 'idle', 0.2, [0,1,2,2,1] );
			this.addAnim( 'shoot', 1, [4] );
			//init timer for fadetime
	    	this.idleTimer = new ig.Timer();
		},
		update: function() {
			//console.log(this.pos.x, this.size.x)
			if(!ig.game.collisionMap.getTile(
				this.pos.x + (this.flip ? +36 : this.size.x -36),
				this.pos.y + this.size.y+1
			)){
				this.flip = !this.flip;
			}
			var xdir = this.flip ? -1 : 1;
			
			this.currentAnim.flip.x = this.flip;

		    if(this.idleTimer.delta() > this.lifetime){
		    	this.shootTimer = new ig.Timer();
		    	this.vel.x = 0;
		    	this.vel.y = 0;
				var x = this.pos.x + (this.flip ? -4 : 22 );
				var y = this.pos.y + 15;
				ig.game.spawnEntity( EntityPoderEnemy1, x, y, {flip:this.flip} );
		    }else{
		    	this.vel.x = this.speed * xdir;
		    	this.currentAnim = this.anims.idle;
		    }
		    if(this.shootTimer){
			    if(this.shootTimer.delta() < this.shoottime){
			    	this.currentAnim = this.anims.shoot;
			    	this.idleTimer = new ig.Timer();
			    	this.vel.x = 0;
		    		this.vel.y = 0;
			    }
		    }

			
			

			// move!
			this.parent();
		},
		check: function(other){
			other.receiveDamage(10, this);
		},
		handleMovementTrace: function(res){
			this.parent(res)
			if(res.collision.x){
				this.flip = !this.flip;
			}

		}
	});

	EntityPoderEnemy1 = ig.Entity.extend({
		size: {x: 16, y: 12},
		offset: {x: 0, y: 0},
		maxVel: {x: 100, y: 100},

		gravityFactor: 0,

		bounciness: 0.3, 
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A, // Check Against B - our evil enemy group
		collides: ig.Entity.COLLIDES.LITE,
			
		animSheet: new ig.AnimationSheet( 'media/poder_celeste.png', 16, 12 ),

		bounceCounter: 0,	

		lifetime: 1.5,

		alpha: 1,

		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
			this.addAnim( 'idle', 1, [3] );
			this.currentAnim.flip.x = settings.flip;
			this.idleTimer = new ig.Timer();
		},
		handleMovementTrace: function( res ) {
			this.parent( res );

			
			var cLife = this.lifetime-this.idleTimer.delta()
			
			if(cLife<0.5){
				this.alpha = this.alpha  - 0.02;
				this.currentAnim.alpha = this.alpha;
			}


			if( res.collision.x || res.collision.y || this.idleTimer.delta() > this.lifetime) {
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
			other.lifePlayer = 'asdasd';

			this.kill();
		}
	});
});