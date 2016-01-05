var Pin = Pin || {};
Pin.Event = Pin.Event || {};

Pin.Event.Switch = Pin.Event.AbstractEvent.extend({
	index: undefined,
	state: undefined,

	init: function(elapsedTime, index, state) {
		this._super(elapsedTime);
		this.index = index;
		this.state = state;
	},

	perform: function(switchState) {
		switchState[this.index] = this.state;
		return switchState;
	}
});