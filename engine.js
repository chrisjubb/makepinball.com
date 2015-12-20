var Pin = Pin || {};

Pin.Engine = Class.extend({
	physicsConfig: undefined,

	setPhysicsConfig: function(physicsConfig) {
		this.physicsConfig = physicsConfig;
	},

	getPhysicsConfig: function() {
		return this.physicsConfig;
	}
});
