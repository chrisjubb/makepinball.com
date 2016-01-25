var requirejs = require("requirejs");

requirejs.config({
	nodeRequire: require,
});

function createButton(five, pin) {
	return new five.Button({
		pin: pin,
		invert: true,
		isPullup: true
	});
}

function isPWM(pin) {
	if(pin == 3 ||
		pin == 5 ||
		pin == 6 ||
		pin == 9 ||
		pin == 10 ||
		pin == 11) {
		return true;
	}

	return false;
}

requirejs(["johnny-five"],
function(five) {

	var board = new five.Board();
	board.on("ready", function() {
		console.log("Board is ready!");

		var lightStart = 2;
		var lightEnd = 13;

		var lights = [];
		for(var i = lightStart; i <= lightEnd; ++i) {
			var led = new five.Led(i);
			led.on();
			lights.push(led);
		}

		createButton(five, "A0").on("press", function() {
			console.log("Button pressed - A0");
			lights[0].toggle();
		});

		createButton(five, "A1").on("press", function() {
			console.log("Button pressed - A1");
			lights[1].toggle();
		});

		createButton(five, "A2").on("press", function() {
			console.log("Button pressed - A2");
			lights[2].toggle();
		});

		createButton(five, "A3").on("press", function() {
			console.log("Button pressed - A3");
			lights[3].toggle();
		});

		createButton(five, "A4").on("press", function() {
			console.log("Button pressed - A4");
			lights[4].toggle();
		});

		createButton(five, "A5").on("press", function() {
			console.log("Button pressed - A5");
			lights[5].toggle();
		});
	});
});
