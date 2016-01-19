requirejs.config({
	paths: {
		jquery: "lib/jquery",
		underscore: "lib/underscore",
		backbone: "lib/backbone",
		jclass: "lib/jclass",

		config: "config/config"
	},

	shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        jclass: {
        	exports: "JClass"
        }
    }
});

require(["jquery", "underscore", "backbone", "config", "game"],
function($, _, Backbone, Config, Game) {

	console.log("jquery = " + $);
	console.log("underscore = " + _);
	console.log("Backbone = " + Backbone);

	console.log("Config = " + Config);
	console.log("Game = " + Game);

	var game = new Game();
	console.log(game.SW_LEFT_FLIPPER);

});