<?php
	//Start the session
	session_start();
?>
<!DOCTYPE html>
<html>
<head>
	<title>ZK Hangman Game</title>

	<style type="text/css">

		html,body {
			background-color: #333;
			color: #fff;
			margin: 0;
			padding: 0;
			font-size: 12pt;
		}
		
		#canvas {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
		}
	</style>
	

	<script>
		<?php
			// WEB3JS INTERFACE CODE
			require_once $_SERVER['DOCUMENT_ROOT'] . "/math-city/code/js/web3js/web3.min.js";
			require_once $_SERVER['DOCUMENT_ROOT'] . "/math-city/code/js/wallet-connect.php";
		?>
	</script>
	
	<script type="text/javascript">
		/*Preload Title Screen Images*/
		var tsImage = new Image();
		tsImage.src = 'media/buttons-and-logos/logo.png';
		var conBut = new Image();
		conBut.src = 'media/buttons-and-logos/connect-button.png';

	</script>
	
		
	<script type="text/javascript" src="lib/impact/impact.js"></script>
	<script type="text/javascript" src="lib/game/main.js"></script>
	
	
</head>
<body>

	<canvas id="canvas"></canvas>
	
</body>
	<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/math-city/code/js/abi-01.php'); ?>
	
	<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/math-city/code/js/contract-functions.php'); ?>
	
</html>