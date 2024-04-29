ig.module(
	'game.entities.button'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityButton=ig.Entity.extend({
	size: {x: 1, y: 1},
	maxVel: {x: 000, y: 000},
	name: null,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	
	clicked: false,
	purpose: false,
	itemCost: null,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(245, 66, 212, 1)',
	
	//clickSound: new ig.Sound( 'media/sounds/new-game.*' ),
	
	init: function( x, y, settings ) {
		this.parent(x, y, settings);	
		this.giveMeASecond = new ig.Timer(.33);
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.giveMeASecond.set(.33);
		this.clicked = false;
	},
	
	update: function() {
		if (this.name == "connect"){
			this.size.x =  ig.game.conButWidth ;
			this.size.y =  ig.game.conButHeight; 
			this.pos.x = ig.game.screen.x + ig.game.conButX;
			this.pos.y = ig.game.screen.y + ig.game.conButY;
			
			if (!ig.game.titleScreen){
				this.kill();
			}
		}
		if (this.name == "join"){
			this.size.x =  ig.game.gsButtonWidth;
			this.size.y =  ig.game.gsButtonHeight; 
			this.pos.x = ig.game.screen.x + ig.game.gsButtonX;
			this.pos.y = ig.game.screen.y + ig.game.gsButtonJGY;
			
			if (!ig.game.pregame){
				this.kill();
			}
		}
		if (this.name == "start"){
			this.size.x =  ig.game.gsButtonWidth;
			this.size.y =  ig.game.gsButtonHeight; 
			this.pos.x = ig.game.screen.x + ig.game.gsButtonX;
			this.pos.y = ig.game.screen.y + ig.game.gsButtonNGY;
			
			if (!ig.game.pregame){
				this.kill();
			}
		}
		if (this.name == "submitGuess"){
			this.size.x =  ig.game.sgButtonWidth;
			this.size.y =  ig.game.sgButtonHeight; 
			this.pos.x = ig.game.screen.x + ig.game.sgButtonX;
			this.pos.y = ig.game.screen.y + ig.game.sgButtonY;
		}
		//Click me
		if (ig.input.released('click') && this.inFocus() && this.giveMeASecond.delta() > 0 ) {
			
			//Click Start Button
			if (this.name == "connect"){
				connectMyWallet();
			}
			else if (this.name == "join"){
				ig.game.oldMsg = ig.game.msgToPlayer;
				ig.game.msgToPlayer = "Enter the Game ID to begin playing.";
				this.joinGame();
			}
			else if (this.name == "start"){
				this.initiateGame();
			}
			else if (this.name == "submitGuess"){
				if (confirm("Are you ready to submit a guess of " + ig.game.valueTotal + " for the secret value?") == true) {
					tryGuess()
				}
			}

		}
		this.parent();
	},
	initiateGame: function() {
		getGameCreationFee();
	},
	joinGame: function(){
		console.log('calling joinGame')
		ig.game.gameId = prompt("What game would you like to join? Enter the GameID.", "");
		ig.game.gameId = parseInt(ig.game.gameId);
		console.log('ig.game.gameId = ' + ig.game.gameId);
		this.playTheGame();
	},
	playTheGame: function(which){
		ig.game.loadLevel(LevelL1);
		ig.game.textToPlayer = false;
		ig.game.gamePickScreen = false;
		ig.game.pregame = false;
		ig.game.spawnEntity( EntityMutebutton, 0, 0);
		ig.game.playMusicBro();
		ig.game.spawnEntity( EntityButton, 10, 10, {'name':'submitGuess'});	
		console.log('spawn button')
	},
	kill: function(){
		this.parent();
	},
	inFocus: function() {
	return (
	   (this.pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
	   ((ig.input.mouse.x + ig.game.screen.x) <= this.pos.x + this.size.x) &&
	   (this.pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
	   ((ig.input.mouse.y + ig.game.screen.y) <= this.pos.y + this.size.y)
	);
 	}
		
});
ig.EntityPool.enableFor( EntityButton );
});