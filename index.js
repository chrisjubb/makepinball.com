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
	var deltaTime = 1.0 / frameInterval;

	board.on("ready", function() {
		console.log("Board is ready!");

		var led = new five.Led(13);
		var on_counter = 0;

		this.loop(frameInterval, function() {
			++on_counter;
			if(on_counter > 50) {
				led.toggle();
				on_counter = 0;
			}

			game.update(switchState, elapsedTime, deltaTime);
			var lightState = game.getLightState();

			elapsedTime += deltaTime;
		});
	});

});
