var Game = Game || {};

Game.Diamond = Class.extend({

	lights: [],
	colourLookup: undefined, // array of bank index -> colour r,g,b,a
	currentGoalIndex: 0,
	goalsComplete: [],

	init: function(lightState, startIndex, endIndex, currentPulseColour, colourLookup) {
		for(var i = startIndex; i <= endIndex; ++i) {
			this.lights.push(lightState[i]);
		}
		this.currentPulseColour = currentPulseColour;
		this.colourLookup = colourLookup;
		this.setCurrentFlashing();
	},

	setCurrentFlashing: function() {
		var c = this.currentPulseColour;
		this.lights[this.currentGoalIndex].reset();
		this.lights[this.currentGoalIndex].pulse(c.r, c.g, c.b, c.a, 0.25);
	},

	completedGoal: function(goalIndex) {
		var self = this;
		this.goalsComplete[this.currentGoalIndex] = goalIndex;

		_.each(this.lights, function(light, lightIndex) {
			light.reset();
			var completedGoalIndex = self.goalsComplete[lightIndex];
			if(completedGoalIndex) {
				var c = self.colourLookup[completedGoalIndex].colour;
				light.pulse(c.r, c.g, c.b, c.a, 0.25);
			}
		});

		this.currentGoalIndex = Math.min(this.currentGoalIndex + 1, this.lights.length - 1);
		this.setCurrentFlashing();
	},

	collect: function() {
		this.currentGoalIndex = 0;
		_.each(this.lights, function(light) {
			light.reset();
		});
		this.goalsComplete = [];
		this.setCurrentFlashing();
	},
});