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

	_destination_r: 1.0,
	_destination_g: 1.0,
	_destination_b: 1.0,
	_destination_a: 1.0,

	fadeState: undefined,
	fadeSpeed: undefined,
	pulseTimer: undefined,
	defaultFadeDuration: 0.25,
	defaultPulseDuration: 0.15,
	FADE_NONE: 0,
	FADE_OUT: 1,
	FADE_IN: 2,
	FADE_PULSE: 3,

	init: function() {
		this.set(this._off_r, this._off_g, this._off_b, this._off_a);
	},

	set: function(r, g, b, a) {
		this.fadeState = this.FADE_NONE;
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
		if(this.fadeState == this.FADE_OUT) {
			return;
		}

		if(this.atOffState()) {
			// no need
			return;
		}

		if(!fadeDuration) {
			fadeDuration = this.defaultFadeDuration;
		}

		this.fadeSpeed = 1.0 / fadeDuration;
		this.fadeState = this.FADE_OUT;

		this._destination_r = this._off_r;
		this._destination_g = this._off_g;
		this._destination_b = this._off_b;
		this._destination_a = this._off_a;
	},

	pulse: function(r, g, b, a, pulseDuration) {
		if(this.fadeState == this.FADE_PULSE) {
			// no need
			return;
		}

		if(!pulseDuration) {
			pulseDuration = this.defaultPulseDuration;
		}

		this.fadeSpeed = 1.0 / (pulseDuration * 0.5);
		this.fadeState = this.FADE_PULSE;
		this.pulseTimer = 0;

		this._destination_r = r;
		this._destination_g = g;
		this._destination_b = b;
		this._destination_a = a;
	},

	atOffState: function() {
		return (this._r == this._off_r) &&
			   (this._g == this._off_g) &&
			   (this._b == this._off_b) &&
			   (this._a == this._off_a);
	},

	update: function(delta) {
		if(this.fadeState == this.FADE_OUT) {
			this._r = Math.max(this._destination_r, this._r - (delta * this.fadeSpeed));
			this._g = Math.max(this._destination_g, this._g - (delta * this.fadeSpeed));
			this._b = Math.max(this._destination_b, this._b - (delta * this.fadeSpeed));
			this._a = Math.max(this._destination_a, this._a - (delta * this.fadeSpeed));

			if(this.atOffState()) {
				this.fadeState = this.FADE_NONE;
			}
		}
		else if(this.fadeState == this.FADE_PULSE) {
			var sinPulseTimer = Pin.Utils.sin01(this.pulseTimer);
			this._r = Pin.Utils.lerp(this._destination_r, this._off_r, sinPulseTimer);
			this._g = Pin.Utils.lerp(this._destination_g, this._off_g, sinPulseTimer);
			this._b = Pin.Utils.lerp(this._destination_b, this._off_b, sinPulseTimer);
			this._a = Pin.Utils.lerp(this._destination_a, this._off_a, sinPulseTimer);

			this.pulseTimer += delta * this.fadeSpeed;
		}
	}
});


/*

var lightColour = new THREE.Vector4(1,1,1,1);
lightColour.x = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 6.0 + 0.00 + lightObject.position.x * 20.0) + 1.0) * 0.5);
lightColour.y = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 5.0 + 0.75 + lightObject.position.y * 20.0) + 1.0) * 0.5);
lightColour.z = Math.max(0.5, (Math.sin(self.clock.elapsedTime * 4.0 + 1.25 + lightObject.position.z * 20.0) + 1.0) * 0.5);

*/