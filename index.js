var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,

    paths: {
		underscore: "lib/underscore",
		jclass: 	"lib/jclass",
		sound_manager: "physical/sound_manager"
	},

	shim: {
        underscore: {
            exports: "_"
        },
        jclass: {
        	exports: "JClass"
        }
    }
});

requirejs(["johnny-five", "game"],
function(five, Game) {

	var game = new Game();
	var board = new five.Board();

	var switchState = [];
	var elapsedTime = 0;
	var frameInterval = 16;
	var deltaTime = frameInterval / 1000.0;

	board.on("ready", function() {
		console.log("Board is ready!");

		var led = new five.Led(13);

		this.loop(frameInterval, function() {
			game.update(switchState, elapsedTime, deltaTime);
			var lightState = game.getLightState();

			// console.log(elapsedTime + " - " + lightState[16].isLit());

			if(lightState[16].isLit()) {
				led.on();
			}
			else {
				led.off();
			}

			elapsedTime += deltaTime;
		});
	});

});
