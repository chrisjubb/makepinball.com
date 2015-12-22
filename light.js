var Pin = Pin || {};

Pin.Light = Class.extend({

	_r: 1.0,
	_g: 1.0,
	_b: 1.0,
	_a: 1.0,

	r: function() {
		return this._r;
	},

	g: function() {
		return this._g;
	},

	b: function() {
		return this._b;
	},

	a: function() {
		return this._a;
	}
});


/*

var lightColour = new THREE.Vector4(1,1,1,1);
lightColour.x = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 6.0 + 0.00 + lightObject.position.x * 20.0) + 1.0) * 0.5);
lightColour.y = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 5.0 + 0.75 + lightObject.position.y * 20.0) + 1.0) * 0.5);
lightColour.z = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 4.0 + 1.25 + lightObject.position.z * 20.0) + 1.0) * 0.5);

*/