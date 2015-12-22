var Pin = Pin || {};

Pin.Light = Class.extend({

	_r: 1.0,
	_g: 1.0,
	_b: 1.0,
	_a: 1.0,

	_off_r: 0.4,
	_off_g: 0.4,
	_off_b: 0.4,
	_off_a: 1.0,

	fadeState: undefined,
	fadeSpeed: undefined,
	defaultFadeDuration: 0.25,
	FADE_NONE: 0,
	FADE_OUT: 1,
	FADE_IN: 2,

	init: function() {
		this.fadeState = this.FADE_NONE;
		this._r = this._off_r;
		this._g = this._off_g;
		this._b = this._off_b;
		this._a = this._off_a;
	},

	set: function(r, g, b, a) {
		this._r = r;
		this._g = g;
		this._b = b;
		this._a = a;
	},

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
	},

	fadeOut: function(fadeDuration) {
		if(this.atOffState()) {
			// no need
			return;
		}

		if(!fadeDuration) {
			fadeDuration = this.defaultFadeDuration;
		}

		this.fadeSpeed = 1.0 / fadeDuration;
		this.fadeState = this.FADE_OUT;
	},

	atOffState: function() {
		return (this._r == this._off_r) &&
			   (this._g == this._off_g) &&
			   (this._b == this._off_b) &&
			   (this._a == this._off_a);
	},

	update: function(delta) {
		if(this.fadeState == this.FADE_OUT) {
			this._r = Math.max(this._off_r, this._r - (delta * this.fadeSpeed));
			this._g = Math.max(this._off_g, this._g - (delta * this.fadeSpeed));
			this._b = Math.max(this._off_b, this._b - (delta * this.fadeSpeed));
			this._a = Math.max(this._off_a, this._a - (delta * this.fadeSpeed));

			if(this.atOffState()) {
				this.fadeState = this.FADE_NONE;
			}
		}
	}
});


/*

var lightColour = new THREE.Vector4(1,1,1,1);
lightColour.x = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 6.0 + 0.00 + lightObject.position.x * 20.0) + 1.0) * 0.5);
lightColour.y = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 5.0 + 0.75 + lightObject.position.y * 20.0) + 1.0) * 0.5);
lightColour.z = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 4.0 + 1.25 + lightObject.position.z * 20.0) + 1.0) * 0.5);

*/