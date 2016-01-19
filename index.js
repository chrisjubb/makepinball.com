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

		var ledLookup = [];
		var switchLookup = [];
		_.each(game.targetBankList3, function(targetBankData, i) {
			var ledIndex = 5 + i;
			var switchIndex = 2 + i;
			console.log("light state index = " + targetBankData.l + " -> " + ledIndex + ", switch = " + targetBankData.s + " -> " + switchIndex);
			ledLookup[targetBankData.l] = new five.Led(ledIndex);
			switchLookup[targetBankData.s] = new five.Switch(switchIndex);
		});

		this.loop(frameInterval, function() {

			_.each(switchLookup, function(switchData, switchDataIndex) {
				if(switchData) {
					switchState[switchDataIndex] = switchData.isClosed;
					// console.log("[" + switchDataIndex + "] = " + switchState[switchDataIndex]);
				}
			});

			game.update(switchState, elapsedTime, deltaTime);
			var lightState = game.getLightState();

			_.each(ledLookup, function(led, lightStateIndex) {
				if(led) {
					if(lightState[lightStateIndex].isLit()) {
						led.on();
					}
					else {
						led.off();
					}
				}
			});

			// console.log(elapsedTime + " - " + lightState[16].isLit());

			elapsedTime += deltaTime;
		});
	});

});
