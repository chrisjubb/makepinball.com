var Pin = Pin || {};

Pin.Engine = Class.extend({
	leftButtonDown: false,
	rightButtonDown: false,

	physicsConfig: undefined,

	setPhysicsConfig: function(physicsConfig) {
		this.physicsConfig = physicsConfig;
	},

	getPhysicsConfig: function() {
		return this.physicsConfig;
	}
});
