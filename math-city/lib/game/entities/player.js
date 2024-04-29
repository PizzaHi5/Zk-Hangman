ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({

	name:"player",
	
	size: {x: 100, y: 175},
	offset: {x: 78, y: 54},
	friction: {x: 8000, y: 0},
	frictionStore: 8000,
	storeVel: {x: 0, y: 0},
	maxVel: {x: 650, y: 2000},
	maxVelStore: {x: 650, y: 2000},
	maxX: 400,
	maxY: 1000,
	maxJumps: 1,
	jumpCount: 0,
	accelGround: 1000,
	accelAir: 1000,
	
	attackLimit: .15,
	
	jump: 1200,
	health: 1,
	
	gravityFactor: 1,
	theGravityFactor: 1,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(245, 66, 212, 1)',
	
	type: ig.Entity.TYPE.A, 
	
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	pause: false,
	flip: false,
	zIndex: 999,
	
	jumpSound: new ig.Sound( 'media/sounds/jump.*' ),
	landSound: new ig.Sound( 'media/sounds/land.*' ),

	playJumpSound: function(){
		if (!ig.game.muteGame){
			this.jumpSound.volume = .25; 
			this.jumpSound.play();
		}	
	},
	
	playLandSound: function(){
		if (!ig.game.muteGame){
			this.landSound.volume = .25; 
			this.landSound.play();
		}	
	},
	
	animSheets: {
		player: new ig.AnimationSheet( 'media/player.png', 256, 256 ),
	},



	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		//Timers

		//this.chargeTimer = new ig.Timer(0);
		this.onSpringTimer = new ig.Timer(0);
		this.victoryTimer = new ig.Timer(0);
		this.deathTimer = new ig.Timer(0);
		
		//Anims
		this.anims.walk = new ig.Animation( this.animSheets.player, 0.1, [0,1,2,3] );
		this.anims.idle = new ig.Animation( this.animSheets.player, 1, [4] );
		this.anims.jump = new ig.Animation( this.animSheets.player, 1, [4] );
		this.anims.fall = new ig.Animation( this.animSheets.player, 1, [3] );
		this.anims.win = new ig.Animation( this.animSheets.player, .5, [1], true );
		this.anims.dying = new ig.Animation( this.animSheets.player, 1, [7], true);
		
		this.currentAnim = this.anims.idle;

	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		
	},
	
	stopLadderNoise: function(){
		this.ladderSoundLooping = false;
		this.ladderSound.stop();
	},
	
	movements: function(){
		// move left or right
		var accelAir = this.accelAir;	
		var accel = this.accelGround;
		
		this.gravityFactor = 1;
		
		if (this.onSpring){
			var jumpFactor = 1.5;
			this.jumpCount = 1;
			this.vel.y = -this.jump * jumpFactor;
			if( ig.input.state('left')) {
				this.accel.x = -accel * jumpFactor;
				this.flip = true;
			}
			else if( ig.input.state('right') ) {
				this.accel.x = accel * jumpFactor;
				this.flip = false;
			}
		}
		else if (ig.input.pressed('jump') && this.jumpCount < this.maxJumps){
			this.vel.y = -this.jump;
			this.jumpCount++;
			this.playJumpSound();
		}
		else if (ig.input.state('left') && ig.input.state('right')){
			this.accel.x = 0;									
		}
		else if( ig.input.state('left')) {
			if (this.vel.x > 0){
				this.accel.x = 0;	
				this.vel.x = 0;
			}
			this.accel.x = -accel;
			this.flip = true;
		}
		else if( ig.input.state('right') ) {
			if (this.vel.x < 0){
				this.accel.x = 0;
				this.vel.x = 0;
			}
			this.accel.x = accel;
			this.flip = false;
		}
		else {
			this.accel.x = 0;
		}
	
	},
	
	animMe: function(){
		//Set Animation
		if (this.dying){
			this.currentAnim = this.anims.dying;
		}
		else if (this.victoryDance && this.vel.y ==0){
			this.currentAnim = this.anims.win;	
		}
		else if( this.vel.y < 0 ) {
			this.currentAnim = this.anims.jump;
		}
		else if( this.vel.y > 0 ) {
			this.currentAnim = this.anims.fall;
		}

		else if( this.vel.x != 0 ) {
			this.currentAnim = this.anims.walk;
		}
		else {
			this.currentAnim = this.anims.idle;
			this.anims.walk.rewind();
		}
		if (this.currentAnim){
			this.currentAnim.flip.x = this.flip;
		}
	},
	checkConditions: function(){
		//Victory (start cut)
		if (this.victoryDance && this.victoryTimer.delta() > 0){
			if (ig.game.gameWon && !ig.game.transition){
				ig.game.endingScreen = true;
				//I kind of want to jump to the transition so I'm doing this odd delay.
				ig.game.fadeOut(-.93, ig.game.color1);				
			}
			else if (!ig.game.transition && !ig.game.gameWon){ 
				//FADEOUT
				//ig.game.fadeOut();
				ig.game.levelCleared = true;
				ig.game.slideRightIn("","",3);
			}
		}

		if (this.dying && this.deathTimer.delta() > 0 && !this.dead){
			//Process Death Data - Reload
			ig.game.processTokens('rewind');
			ig.game.pData.deaths++;
			ig.game.saveGame();
			this.dead = true;
			ig.game.playerDead = true;
			ig.game.fadeOut(0, ig.game.colorWrong);	
		}
		//initiate dying sequence when health drops below 0
		if (this.health <= 0 && !this.dying){
			//Fade out to red or colorwrong
			this.initDeathSeq("fallThrough");
		}
		
		var maxX = ig.game.collisionMap.width * ig.game.collisionMap.tilesize;
		var maxY = ig.game.collisionMap.height * ig.game.collisionMap.tilesize;
		//Kill me if I fall out of collision area for some buggy reason.
		if (this.pos.y < 0 && !this.dying|| this.pos.x < 0 && !this.dying || this.pos.y > maxY && !this.dying || this.pos.x > maxX && !this.dying){
			this.initDeathSeq();
		}
		
		//Springs
		if (this.onSpring && this.onSpringTimer.delta() > 0){
			this.onSpring = false;	
			ig.game.springSound = false;
		}
		
		
	},

	update: function() {
		
		 if (this.dying){
			//Death stuff
			this.vel.x = 0;	
			this.accel.x = 0;
			this.maxVel.y =  this.jump;
			this.vel.y = this.jump;
			this.collides = ig.Entity.COLLIDES.NEVER;
			this.type = ig.Entity.TYPE.NONE;
			if (this.deathMode == "fallThrough"){
			
			}
		}
		else if (this.onSpring){
			this.maxVel.y = this.maxVelStore.y * 3;
		}
		else{
			this.maxVel.y = this.maxVelStore.y;
		}
		this.movements();


		//Set Animation
		this.checkConditions();
		this.animMe();
		
		
		this.parent();
	},
	
	initDeathSeq: function(deathMode){
		if (deathMode){
			this.deathMode = deathMode;
		}
		if (deathMode == "fallThrough"){
			this.collides = ig.Entity.COLLIDES.NEVER;	
		}
		this.deathAnim = true;
		this.anims.dying.rewind();
		this.dying = true;
		ig.game.dying = true;
		this.deathTimer.set(2);
		
		//Make a wrong sound
		if (!ig.game.muteGame){	ig.game.deadSound.volume = .5; ig.game.deadSound.play();  ig.game.deathNoise();}
		//Dont forget to figure out this token logic that is not currently relevant
		ig.game.lastTokens = ig.game.pData.tokensLT;
	},
	kill: function(){
		this.parent();
	},

	
	handleMovementTrace: function( res ) {
		if (this.deathMode == "fallThrough" && this.dying){
			//float through walls
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;	
		}
		else{
			
			if( res.collision.y || res.collision.slope ){
				
				if (res.pos.y >= this.pos.y && this.jumpCount > 0){
					this.playLandSound();
					this.jumpCount = 0;	
				}
				else if (res.pos.y < this.pos.y){
					this.playLandSound();
				}

				if (!this.landed){
					this.landed = true;
					ig.game.sortEntitiesDeferred();
					ig.game.transition = false;
					ig.game.readyToLoad = false;
					//ig.game.playMusicBro();
					//This prevents the player from reseting the cut animation over and over again.
					ig.game.cutCleared = false;
				}
			}
			
			//Continue resolving the collision as normal
			this.parent(res); 
		}
	}
});

ig.EntityPool.enableFor( EntityPlayer );

});
