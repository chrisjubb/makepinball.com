var Pin = Pin || {};
Pin.Event = Pin.Event || {};

Pin.Event.AbstractEvent = Class.extend({
	elapsedTime: undefined,

	init: function(elapsedTime) {
		this.elapsedTime = elapsedTime.toFixed(2);
	},

	perform: function(switchState) {
		console.error("Override me");
	}
});