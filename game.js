var Pin = Pin || {};

Pin.Game = Class.extend({

	engine: undefined,
	lightState: [],
	forceState: [],

	init: function(engine) {
		this.engine = engine;
	},

	update: function(switchState) {
		this.forceState[0] = switchState[1002];
	},

	getLightState: function() {
		return this.lightState;
	},

	getForceState: function() {
		return this.forceState;
	}

});
