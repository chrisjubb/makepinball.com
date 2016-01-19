var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,

    paths: {
		underscore: "lib/underscore",
		jclass: "lib/jclass"
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

	//console.log(five);
	console.log(Game);

	var game = new Game();

	//var board = new five.Board();

});

/*
// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
	console.log("Ready!");

	var led = new five.Led(13);
	var on_counter = 0;

	this.loop(16, function() {
		++on_counter;
		if(on_counter > 50) {
			led.toggle();
			on_counter = 0;
		}

		// console.log("frame");
	});
});

*/