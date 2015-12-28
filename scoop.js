var Pin = Pin || {};

Pin.Scoop = Class.extend({

	switchIndex: undefined,
	state: undefined,

	STATE_HITTING: 0,
	STATE_HIT: 1,
	STATE_INSIDE: 2,

	init: function(switchIndex) {
		this.switchIndex = switchIndex;
		this.state = this.STATE_HITTING;
	},

	getSwitchIndex: function() {
		return this.switchIndex;
	},

	update: function(switchState) {
		if(this.state == this.STATE_HITTING) {
			if(switchState[this.switchIndex]) {
				this.state = this.STATE_HIT;
			}
		}
		else if(this.state == this.STATE_HIT) {
			// one frame
			this.state = this.STATE_INSIDE;
		}
	},

	shouldDeactivate: function() {
		return this.state == this.STATE_HIT;
	}
});