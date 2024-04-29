ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	//'impact.debug.debug',
	'game.entities.button',
	'game.entities.mutebutton',
	'game.entities.player',
	'game.entities.valuedumper',
	'game.levels.l1'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	gravity: 2000,
	pause: true,
	titleScreen: true,
	tsbgColor: "#200d01",
	
	defaultFontSize: 40,
	defaultFontFace: "Sans-serif",
	defaultLineHeight: 44,
	defaultStrokeWidth: 4,
	msgToPlayer: "Messages go here",
	
	valueDir: "adding",
	valueTotal: 0,
	
	//Mute Buttons
	buttonMute: new ig.Image( 'media/buttons-and-logos/button-mute.png' ),
	buttonMuted: new ig.Image( 'media/buttons-and-logos/button-muted.png' ),
	buttonMuteSmall: new ig.Image( 'media/buttons-and-logos/button-mute-small.png' ),
	buttonMutedSmall: new ig.Image( 'media/buttons-and-logos/button-muted-small.png' ),

	muteGame: false,
	musicLevel: .5,
	
	redColor: "#8A0303",
	whiteColor: "#E1E4E6",
	greyColor: "#42464D",
	blackColor: "#212121",
	blueColor: "#657786",
	
	youWinSound: new ig.Sound( 'media/sounds/you-win.*' ),
	//Preloaded Songs
	songs: {
		l1: new ig.Sound('media/music/castlegreyskull.*', false ),
	},
	
	init: function() {
		//Bind Inputs
		ig.input.bind(ig.KEY.MOUSE1, 'click');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );

		//Load Title Screen images into impact
		this.loadTSImages();


		this.transitionTimer = new ig.Timer(0);
		
		ig.game.spawnEntity( EntityButton, 10, 10, {'name':'connect'});	

		//MUSIC
		ig.music.add (this.songs.l1, 01, ["l1"] );
		
		ig.music.loop = true;
		ig.music.volume = this.musicLevel;	
		
		
	},
	playMusicBro: function(){
		this.songs.l1.loop = true;
		this.songs.l1.volume = .25;
		this.songs.l1.play();
	
		if (!ig.game.muteGame){
			ig.music.volume = ig.game.musicLevel;
		}
		else{
			ig.music.volume = 0;
		}
		
	},
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		//keep player centered
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2;
			this.screen.y = player.pos.y - ig.system.height * .61;
		}

	},
	youWin: function(){
		ig.game.gameWon = true;
		ig.game.winScreen = true;
		this.songs.l1.stop();
		this.youWinSound.play();
	},
	
	startGame: function(){
		ig.game.titleScreen = false;
		ig.game.pause = false;
		ig.game.msgToPlayer = "Welcome to ZK Hangman. Would you like to start a new game or join an existing game?";
		this.textToPlayer = true;
		this.gamePickScreen = true;
		ig.game.pregame = true;
		ig.game.spawnEntity( EntityButton, 10, 10, {'name':'join'});	
		ig.game.spawnEntity( EntityButton, 10, 10, {'name':'start'});	
	},
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		if (this.titleScreen){
			this.drawTitleScreen();
		}
		else if (this.gamePickScreen){
			this.drawGamePickScreen();
			this.drawAccountNumber();
		}
		else if (!ig.game.textToPlayer){
			this.drawMuteButton();
			this.drawGuessValue();
			this.drawAccountNumber();
			this.drawSubmitGuessButton();
		}
		if (this.textToPlayer){
			this.drawMsgBox();
		}
		
		if (ig.game.pregame){
			this.drawGameStartButtons();
		}
		if (ig.game.winScreen){
			this.drawWinScreen();
		}
	},

	spawnButtons: function(){
		//Spawn mute button if not in worldmaker
		if( !ig.game.muteButtonAlive ) { 
			ig.game.spawnEntity( EntityMutebutton, 0, 0);
		}
	},
	loadTSImages: function(){
		this.tsImage = new Image();
		this.tsImage.src = window.tsImage.src;
		this.conButImg = new Image();
		this.conButImg.src = window.conBut.src;
	},
	drawTitleScreen: function(){
		var ctx = ig.system.context;
		var tsHeight = ig.system.height * .6;
		var tsWidth = tsHeight;
		
		var tsImageX = ig.system.width / 2 - (tsWidth / 2);
		var tsImageY = ig.system.height * .1;

		this.conButWidth = tsWidth * .5;
		this.conButHeight = this.conButWidth / 2;
		this.conButX = ig.system.width / 2 - (this.conButWidth / 2);
		this.conButY = tsImageY + tsHeight + 20;
		

		this.drawABox(0, ig.system.width, 0, ig.system.height, 0, this.tsbgColor, true, this.tsbgColor);		
		ctx.drawImage(this.tsImage, tsImageX, tsImageY, tsWidth, tsHeight );
		ctx.drawImage(this.conButImg, this.conButX, this.conButY, this.conButWidth, this.conButHeight );
		
	},
	drawWinScreen: function(){
		this.drawABox(0, ig.system.width, 0, ig.system.height, 0, this.tsbgColor, true, this.tsbgColor);
		this.wordWrap("You Win!", 40, this.blueColor, 100, 100, ig.system.width - 200, 5, true, this.blackColor, 4);

	},
	drawSubmitGuessButton: function(){
		var ctx = ig.system.context;
		ig.game.sgButtonWidth = 300;
		ig.game.sgButtonHeight = 150;
		ig.game.sgButtonX = ig.system.width - ig.game.gsButtonWidth - 20;
		ig.game.sgButtonY = ig.game.sgButtonHeight;
		
		this.drawABox(ig.game.sgButtonX, ig.game.sgButtonX + ig.game.sgButtonWidth, ig.game.sgButtonY , ig.game.sgButtonY  + ig.game.sgButtonHeight, 5, this.blackColor, true, this.whiteColor);
		this.wordWrap("Submit Guess", 40, this.blueColor, ig.game.sgButtonX + 10, ig.game.sgButtonY + 100, ig.game.sgButtonWidth - 20, 5, true, this.blackColor, 4);
	},
	drawMuteButton: function(){
		var bRight = ig.system.width - 84;
		var bTop = 30;
			
		if (this.muteGame){
			if ( window.scale < .7){
				bRight = ig.system.width - 52;
				this.buttonMuted.draw(bRight, bTop);		
			}
			else{
				this.buttonMutedSmall.draw(bRight, bTop);		
			}
		}
		else{
			if ( window.scale < .7){
				bRight = ig.system.width - 52;
				this.buttonMute.draw(bRight, bTop);	
			}
			else{
				this.buttonMuteSmall.draw(bRight, bTop);	
			}
		}
	},
	drawAccountNumber: function(){
		var ctx = ig.system.context;
		ctx.font = `12px '${this.defaultFontFace}', sans-serif`; // Lock in Font Face and Size

		var txt = "Connected As " + window['userAccountNumber'];
		var myTxtWidth = ctx.measureText(txt).width;
		var txtX = ig.system.width - myTxtWidth - 30;
		this.wordWrap(txt, 12, "#72F2EB", txtX, 20, ig.system.width - 200, 14, true, "#747F7F", 1 ); 
	},
	drawGuessValue: function(){
		var ctx = ig.system.context;
		this.wordWrap("My Guess Value: " + ig.game.valueTotal, this.defaultFontSize, "#72F2EB", 30, 100, ig.system.width - 200, this.defaultLineHeight, true, "#747F7F", this.defaultStrokeWidth ); 
		
		if (this.valueDir == "adding"){
			this.wordWrap("ADDING", this.defaultFontSize, this.whiteColor, 30, 200, ig.system.width - 200, this.defaultLineHeight, true, this.redColor, this.defaultStrokeWidth ); 
		}
		else if (this.valueDir == "subtract"){
			this.wordWrap("SUBTRACTING", this.defaultFontSize, this.redColor, 30, 200, ig.system.width - 200, this.defaultLineHeight, true, this.whiteColor, this.defaultStrokeWidth ); 
		}
		
		this.wordWrap("Game ID: " + ig.game.gameId, this.defaultFontSize, "#72F2EB", 30, 300, ig.system.width - 200, this.defaultLineHeight, true, "#747F7F", this.defaultStrokeWidth ); 

	},
	drawGamePickScreen: function(){
		var ctx = ig.system.context;
		this.drawABox(0, ig.system.width, 0, ig.system.height, 0, this.tsbgColor, true, this.tsbgColor);
	},
	drawGameStartButtons: function(){
		ig.game.gsButtonWidth = 300;
		ig.game.gsButtonHeight = 150;
		ig.game.gsButtonX = ig.system.width - ig.game.gsButtonWidth * 1.5;
		ig.game.gsButtonNGY = ig.game.ObjBxB + ig.game.gsButtonHeight * .5;
		ig.game.gsButtonJGY = ig.game.gsButtonNGY + ig.game.gsButtonHeight * 1.5;
		
		//drawABox: function(lx, rx, ty, by, lineWidth, lineColor, fill, fillcolor){	
		this.drawABox(ig.game.gsButtonX, ig.game.gsButtonX + ig.game.gsButtonWidth, ig.game.gsButtonNGY , ig.game.gsButtonNGY  + ig.game.gsButtonHeight, 5, this.blackColor, true, this.whiteColor);
		this.wordWrap("New Game", 40, this.blueColor, ig.game.gsButtonX + 10, ig.game.gsButtonNGY + 100, ig.game.gsButtonWidth - 20, 5, true, this.blackColor, 4);
		this.drawABox(ig.game.gsButtonX, ig.game.gsButtonX + ig.game.gsButtonWidth, ig.game.gsButtonJGY , ig.game.gsButtonJGY  + ig.game.gsButtonHeight, 5, this.blackColor, true, this.blueColor);
		this.wordWrap("Join Game", 40, this.whiteColor, ig.game.gsButtonX + 10, ig.game.gsButtonJGY + 100, ig.game.gsButtonWidth - 20, 5, true, this.blackColor, 4);
	},
	
	/*
	
	redColor: "#8A0303";\n\t whiteColor: "#E1E4E6";\n\t greyColor: "#42464D";\n\t blackColor: "#212121";\n\t blueColor: "#657786";\n\t
	*/
	
	drawMsgBox: function(){
		var ctx = ig.system.context;
			
		ig.game.ObjBxWidth = ig.system.width * .9;
		ig.game.ObjBxHeight = ig.system.height *.35;
		ig.game.ObjBxL = ig.system.width * .05;
		ig.game.ObjBxR = ig.game.ObjBxL + ig.game.ObjBxWidth;
		ig.game.ObjBxT = ig.system.height *.05;
		ig.game.ObjBxB = ig.game.ObjBxT + ig.game.ObjBxHeight;
		ig.game.ObjBxMarginX = ig.system.width *.02;
		ig.game.ObjBxMarginY = ig.system.height *.02;
			
		var txtX = ig.game.ObjBxL + ig.game.ObjBxMarginX;
		var txtY = ig.game.ObjBxT + ig.game.ObjBxMarginY + this.defaultLineHeight;
		var txtBxWidth = ig.game.ObjBxWidth - (ig.game.ObjBxMarginX  * 2);
																									//Frame Clr		  //BoxBG
		this.drawABox2(ig.game.ObjBxL, ig.game.ObjBxR, ig.game.ObjBxT, ig.game.ObjBxB, 4, "#F8F8FF", true, "#383838", 1, .6 );
		this.wordWrap(ig.game.msgToPlayer, this.defaultFontSize, "#72F2EB", txtX, txtY, txtBxWidth, this.defaultLineHeight, true, "#747F7F", this.defaultStrokeWidth ); 
	},
	drawTransition: function(){
		var ctx = ig.system.context;

		//*************FadeOut*************
		if (this.transitionType == "fadeOut"){
			var curOpacity = 1;
			if (this.transitionTimer.delta() < 1){
				curOpacity = this.transitionTimer.delta();
			}
			//Level is Ready to Load
			if (this.transitionTimer.delta() > 1){
				this.deathScreen = true;	
			}
			//Prepare Transition for Clear
			if (this.transitionTimer.delta() > 2){
				this.transitionReady = true;
				this.transition = false;
			}
			ctx.globalAlpha = curOpacity;
			this.drawABox(0, ig.system.width, 0, ig.system.height, 0, this.slideColor, true, this.fadeColor);
		}
	
		
		//Restore Alpha
		ctx.globalAlpha = 1;	
	},
	wordWrap: function(text, fontpx, fontColor, x, y, maxWidth, varLineHeight, stroke, strokeColor, strokeWidth, fontFace) {
		var ctx = ig.system.context;
	
		var fontSize = fontpx ? fontpx : this.defaultFontSize; // Set Font Size or Default
		var myFontFace = fontFace ? fontFace : this.defaultFontFace;
		ctx.font = `${fontSize}px '${myFontFace}', sans-serif`; // Lock in Font Face and Size
		var lineHeight = varLineHeight ? varLineHeight : fontpx * 1.1; // Set Line Height Based on Font Size
		var storedML = ctx.miterLimit;
		ctx.miterLimit = 2; // Keeps Some Letters from Getting Too Close
		ctx.strokeStyle = strokeColor ? strokeColor : "black"; // Set Outline Color
		ctx.lineWidth = strokeWidth ? strokeWidth : fontSize * .1; // Set Outline Size or Default to 10%
		ctx.fillStyle = fontColor ? fontColor : 'green'; // Set Text Color or Default
	
		var initialX = x; // Save initial x position for cursor calculation

		var paragraphs = text.split('\n');
		for (var p = 0; p < paragraphs.length; p++) {
			var words = paragraphs[p].split(' ');
			let line = '';
			x = initialX; // Reset x to initial x at the start of each paragraph

			for (let i = 0; i < words.length; i++) {
				var testLine = line + words[i] + ' ';
				var metrics = ctx.measureText(testLine);
				var testWidth = metrics.width;

				if (testWidth > maxWidth && i > 0) {
					if (stroke) {
						ctx.strokeText(line, x, y); // Stroke the text
					}
					ctx.fillText(line, x, y);   // Fill the text
					line = words[i] + ' ';
					x = initialX; // Reset x to initial x as we are moving to a new line
					y += lineHeight;
				}
				else{
					line = testLine;
				}
			}
			//Render the last line of the current paragraph
			if (stroke) {
				ctx.strokeText(line, x, y); // Stroke the text for the last line if Stroking
			}
			ctx.fillText(line, x, y);   // Fill the text for the last line
	
			// Update cursor position to the end of the last rendered line
			ig.game.lastCursorPosX = x + ctx.measureText(line).width;
			ig.game.lastCursorPosY = y - 34;
			y += lineHeight; // Move the cursor to the next line after a paragraph
		}
	
		ctx.miterLimit = storedML;  // Restore original miter limit
	},

	
	fadeOut: function(delay, color){
		if (!delay){
			ig.game.transitionTimer.set(0);
		}
		else{
			ig.game.transitionTimer.set(delay);	
		}
		
		ig.game.transitionType = "fadeOut";
		ig.game.transition = true;	
		
		if (color){
			ig.game.fadeColor = color;	
		}
		else{
			ig.game.fadeColor =  this.colorWrong;	
		}
	},
	
	drawABox: function(lx, rx, ty, by, lineWidth, lineColor, fill, fillcolor){
		var ctx = ig.system.context;
		ctx.beginPath();	
		
		ctx.moveTo(lx, ty);
		ctx.lineTo(rx, ty);
		ctx.lineTo(rx, by);
		ctx.lineTo(lx, by);
		ctx.lineTo(lx, ty);
		
		ctx.closePath();
		
		if(lineWidth){
			ctx.lineWidth = lineWidth;
		}
		if (lineColor){
			ctx.strokeStyle = lineColor;
		}
		
		ctx.stroke();
		
		if (fillcolor){
			ig.system.context.fillStyle = fillcolor;
		}
		if (fill == true){
			ctx.fill();	
		}
	},

	drawABox2: function(lx, rx, ty, by, lineWidth, lineColor, fill, fillcolor, opacityL, opacityF){
		var ctx = ig.system.context;
			
		ctx.globalAlpha = opacityL ? opacityL : 1;
			
		ctx.beginPath();	
			
		ctx.moveTo(lx, ty);
		ctx.lineTo(rx, ty);
		ctx.lineTo(rx, by);
		ctx.lineTo(lx, by);
		ctx.lineTo(lx, ty);
		
		ctx.closePath();
		
		if(lineWidth){
			ctx.lineWidth = lineWidth;
		}
		if (lineColor){
			ctx.strokeStyle = lineColor;
		}
			
		ctx.stroke();
			
		ctx.globalAlpha = opacityF ? opacityF : 1;
			
		if (fillcolor){
			ig.system.context.fillStyle = fillcolor;
		}
		if (fill == true){
			ctx.fill();	
		}
		//Restore Opacity
		ctx.globalAlpha = 1;
	},
	
	resizeYo: function(){
		//Set Canvas Width Minus Ads
		this.cWidth = window.innerWidth;
		this.cHeight = window.innerHeight;
		
		// Resize the canvas style and tell Impact to resize the canvas itself;
		canvas.style.width = this.cWidth + 'px';
		canvas.style.height = this.cHeight + 'px';

		var scale = 1;

		ig.system.resize( this.cWidth * scale, this.cHeight * scale);


	}

	
});


var scale = 1;

//Scale the Canvas to the Screen
canvas.style.width = window.innerWidth + 'px';
canvas.style.height =window.innerHeight+ 'px';

window.addEventListener('resize', function(){

	// If the game hasn't started yet, there's nothing to do here
	if( !ig.system ) { return; }
		if (ig.game){
			ig.game.resizeYo();
		}
	}, false);

// Resize the canvas style and tell Impact to resize the canvas itself;
var width = window.innerWidth * scale,
height = window.innerHeight * scale;
ig.main( '#canvas', MyGame, 60, width, height, 1 );

});
