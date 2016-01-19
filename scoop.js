define(["jclass"], function(JClass) {

return JClass.extend({

	switchIndex: undefined,
	state: undefined,

	STATE_HITTING: 0,
	STATE_HIT: 1,
	STATE_INSIDE: 2,
	STATE_RELEASE_START: 3,
	STATE_RELEASE_ACTIVE: 4,

	init: function(switchIndex) {
		this.switchIndex = switchIndex;
		this.state = this.STATE_HITTING;
	},

	getSwitchIndex: function() {
		return this.switchIndex;
	},

	reset: function() {
		this.state = this.STATE_HITTING;
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
		else if(this.state == this.STATE_INSIDE) {
			if(switchState[this.switchIndex] == false) {
				this.reset();
			}
		}
		else if(this.state == this.STATE_RELEASE_START) {
			// one frame
			this.state = this.STATE_RELEASE_ACTIVE;
		}
		else if(this.state == this.STATE_RELEASE_ACTIVE) {
			if(switchState[this.switchIndex] == false) {
				this.reset();
			}
		}
	},

	release: function() {
		if(this.state == this.STATE_INSIDE || this.state == this.STATE_HIT) {
			this.state = this.STATE_RELEASE_START;
		}
	},

	shouldDeactivate: function() {
		return this.state == this.STATE_HIT;
	},

	shouldActivate: function() {
		return this.state == this.STATE_RELEASE_START;
	}
});

}); // require