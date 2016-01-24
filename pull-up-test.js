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

requirejs(["johnny-five"],
function(five) {

	var board = new five.Board();

	board.on("ready", function() {
		console.log("Board is ready!");

		createButton(five, "A0").on("press", function() {
			console.log("Button pressed - A0");
		});

		createButton(five, "A1").on("press", function() {
			console.log("Button pressed - A1");
		});

		createButton(five, "A2").on("press", function() {
			console.log("Button pressed - A2");
		});

		createButton(five, "A3").on("press", function() {
			console.log("Button pressed - A3");
		});

		createButton(five, "A4").on("press", function() {
			console.log("Button pressed - A4");
		});

		createButton(five, "A5").on("press", function() {
			console.log("Button pressed - A5");
		});

	});

});
