var Game = Game || {};

Game.Diamond = Class.extend({

	lights: [],
	colourLookup: undefined, // array of bank index -> colour r,g,b,a
	currentGoalIndex: 0,
	goalsComplete: [],
	displayingGoalsComplete: [], // when animating the collection, use this.
	state: undefined,
	displayTimer: 0.0,
	STATE_COLLECTING: 0,
	STATE_DISPLAYING: 1,
	STATE_DISPLAY_COMPLETE: 2,

	init: function(lightState, startIndex, endIndex, currentPulseColour, colourLookup) {
		for(var i = startIndex; i <= endIndex; ++i) {
			this.lights.push(lightState[i]);
		}
		this.currentPulseColour = currentPulseColour;
		this.colourLookup = colourLookup;
		this.state = this.STATE_COLLECTING;
		this.setCurrentFlashing();
	},

	setCurrentFlashing: function() {
		if(this.currentGoalIndex != (this.lights.length - 1)) {
			var c = this.currentPulseColour;
			this.lights[this.currentGoalIndex].reset();
			this.lights[this.currentGoalIndex].pulse(c.r, c.g, c.b, c.a, 0.25);
		}
	},

	completedGoal: function(goalIndex) {
		this.goalsComplete[this.currentGoalIndex] = goalIndex;

		// don't want to complete - stay on the last one
		this.currentGoalIndex = Math.min(this.currentGoalIndex + 1, this.lights.length - 1);

		if(this.state == this.STATE_COLLECTING) {
			this.setLights(this.goalsComplete, false);
			this.setCurrentFlashing();
		}
	},

	collect: function(elapsedTime) {
		if(this.state == this.STATE_COLLECTING) {
			if(this.currentGoalIndex == 0) {
				this.state == this.STATE_DISPLAY_COMPLETE;
			}
			else {
				this.state = this.STATE_DISPLAYING;
				this.currentGoalIndex = 0;
				this.displayingGoalsComplete = _.clone(this.goalsComplete);
				this.setLights(this.displayingGoalsComplete, true);
				this.goalsComplete = [];
				this.displayTimer = elapsedTime + 1.0;
			}
		}
	},

	canCollect: function() {
		return this.currentGoalIndex != 0;
	},

	isCollectComplete: function() {
		return this.state == this.STATE_DISPLAY_COMPLETE;
	},

	setLights: function(goalsState, fullOn) {
		var self = this;
		_.each(this.lights, function(light, lightIndex) {
			light.reset();
			var completedGoalIndex = goalsState[lightIndex];
			if(completedGoalIndex != undefined) {
				var c = self.colourLookup[completedGoalIndex].colour;
				if(fullOn) {
					light.set(c.r, c.g, c.b, c.a);
				}
				else {
					light.pulse(c.r, c.g, c.b, c.a, 0.25);
				}
			}
		});
	},

	update: function(deltaTime, elapsedTime) {
		if(this.state == this.STATE_DISPLAYING) {
			if(elapsedTime > this.displayTimer) {
				this.state = this.STATE_DISPLAY_COMPLETE;
			}
		}
		else if(this.state == this.STATE_DISPLAY_COMPLETE) {
			this.currentGoalIndex = 0;
			_.each(this.lights, function(light) {
				light.reset();
			});
			this.displayingGoalsComplete = [];
			this.setCurrentFlashing();
			this.state = this.STATE_COLLECTING;
		}
	}
});