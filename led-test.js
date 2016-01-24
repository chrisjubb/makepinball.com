var requirejs = require("requirejs");

requirejs.config({
	nodeRequire: require,
});

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
			if(isPWM(i)) {
				led.pulse(500);
			}
			else {
				led.blink(500);
			}
			lights.push(led);
		}
	});
});
