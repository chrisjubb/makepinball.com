var Game = Game || {};

Game.Diamond = Class.extend({

	lights: [],
	colourLookup: undefined, // array of bank index -> colour r,g,b,a
	currentGoalIndex: 0,
	goalsComplete: [],
	displayingGoalsComplete: [], // when animating the collection, use this.
	goalGroups: [],
	state: undefined,
	displayTimer: 0.0,
	displayGoalIndex: 0, // which goal
	displayGoalLightIndex: 0, // which index within the goal

	// by light id:
	//        15
	//		13  14
	//   10   11   12
	// 6    7    8     9
	//   3     4     5
	//      1    2
	//         0

	// ok to have 1->2 and 2->1 (we check for already visited nodes)
	// only have connections point upwards (eg. 1->3 but not 3->1)
	connections: [
		[1, 2], 			// 0
		[2, 3, 4], 			// 1
		[1, 4, 5], 			// 2
		[4, 6, 7], 			// 3
		[3, 5, 7, 8],		// 4
		[4, 8, 9], 			// 5
		[7, 10], 			// 6
		[6, 8, 10 ,11], 	// 7
		[7, 9, 11, 12],		// 8
		[8, 12], 			// 9
		[11, 13], 			// 10
		[10, 12, 13, 14],	// 11
		[11, 14], 			// 12
		[14, 15], 			// 13
		[13, 15], 			// 14
		[], 				// 15
	],

	STATE_COLLECTING: 0,
	STATE_DISPLAY_START: 1, // go from pulse to full on
	STATE_DISPLAY_COLLECT_GROUP_START: 2, // one frame
	STATE_DISPLAY_COLLECT_GROUP: 3, // run through a group,
	STATE_DISPLAY_FADE_GROUP: 4, // fade out the group -> STATE_DISPLAY_COLLECT_GROUP
	STATE_DISPLAY_COMPLETE: 5,

	// all in seconds
	TIME_AFTER_COLLECT: 1.0,
	TIME_BETWEEN_GROUPS: 0.5,
	TIME_FLASHING_GROUP: 0.5,
	TIME_FLASHING_GROUP_DURATION: 0.1,
	TIME_FLASHING_INDIVIDUAL_GROUP_LIGHT: 0.25,
	TIME_FLASHING_INDIVIDUAL_GROUP_DURATION: 0.05,
	TIME_GROUP_LIGHT_FADE_OUT: 1.0,

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
				this.state = this.STATE_DISPLAY_COMPLETE;
			}
			else {
				this.state = this.STATE_DISPLAY_START;
				this.currentGoalIndex = 0;
				this.displayingGoalsComplete = _.clone(this.goalsComplete);
				this.goalGroups = this.buildGroups(this.displayingGoalsComplete);
				this.setLights(this.displayingGoalsComplete, true);
				this.goalsComplete = [];
				this.displayTimer = elapsedTime + this.TIME_AFTER_COLLECT;
				this.displayGoalIndex = 0;
				this.displayGoalLightIndex = 0;
			}
		}
	},

	canCollect: function() {
		return this.currentGoalIndex != 0;
	},

	isCollectComplete: function() {
		return this.state == this.STATE_DISPLAY_COMPLETE;
	},

	isCollectProgress: function() {
		return this.state == this.STATE_DISPLAY_COLLECT_GROUP_START;
	},

	currentLightColour: function() {
		if(this.state == this.STATE_DISPLAY_FLASH_GROUP) {
			var goal = this.getCurrentGoal();
			var c = this.colourLookup[goal.goalIndex].colour;
			return c;
		}
		else {
			return undefined;
		}
	},

	buildGroups: function(goalsComplete) {
		// take the goalsComplete list and build a list of groups from it
		var groups = [];
		// if we have used this position to build a group
		var usedPositionIndices = [];

		var self = this;
		_.each(goalsComplete, function(goalIndex, positionIndex) {
			if(	goalIndex != undefined &&
				usedPositionIndices[positionIndex] === undefined) {

				var group = {goalIndex: goalIndex, entries: []};
				self.buildGroupGivenPosition(	goalsComplete,
												goalIndex,
												positionIndex,
												group.entries,
												usedPositionIndices);

				group.entries = _.sortBy(_.union(group.entries));
				groups.push(group);
			}
		});

		return groups;
	},

	buildGroupGivenPosition: function(	goalsComplete,
										goalIndex,
										positionIndex,
										entryArray, // inout
										usedPositionIndices // inout
									  ) {
		// add ourself
		entryArray.push(positionIndex);
		usedPositionIndices[positionIndex] = true;

		var self = this;
		// see if any of the connections has the same goalIndex (do this recursively)
		_.each(this.connections[positionIndex], function(connectionPositionIndex) {

			if( goalsComplete[connectionPositionIndex] == goalIndex &&
				usedPositionIndices[connectionPositionIndex] === undefined) {

				self.buildGroupGivenPosition(	goalsComplete,
												goalIndex,
												connectionPositionIndex,
												entryArray,
												usedPositionIndices);
			}

		});
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

	getCurrentGoal: function() {
		return this.goalGroups[this.displayGoalIndex];
	},

	setGroupLights: function(callbackFunction) {
		var self = this;
		var goal = this.getCurrentGoal();
		var c = this.colourLookup[goal.goalIndex].colour;
		_.each(goal.entries, function(positionIndex, arrayIndex) {
			var light = self.lights[positionIndex];
			callbackFunction(light, arrayIndex, c);
		});
	},

	displayNextGroup: function(elapsedTime) {
		this.state = this.STATE_DISPLAY_FLASH_GROUP;
		this.displayTimer = elapsedTime + this.TIME_FLASHING_GROUP;

		this.setGroupLights(function(light, arrayIndex, c) {
			light.reset();
			light.flash(c.r, c.g, c.b, c.a, this.TIME_FLASHING_GROUP_DURATION);
		});
	},

	displayNextGroupLight: function(elapsedTime) {
		this.state = this.STATE_DISPLAY_COLLECT_GROUP_START;
		this.displayTimer = elapsedTime + this.TIME_FLASHING_INDIVIDUAL_GROUP_LIGHT;

		var self = this;
		this.setGroupLights(function(light, arrayIndex, c) {
			if(self.displayGoalLightIndex == arrayIndex) {
				light.flash(c.r, c.g, c.b, c.a, this.TIME_FLASHING_INDIVIDUAL_GROUP_DURATION);
			}
		});
	},

	update: function(deltaTime, elapsedTime) {
		if(this.state == this.STATE_DISPLAY_START) {
			// delay at the start
			if(elapsedTime > this.displayTimer) {
				this.displayNextGroup(elapsedTime);
			}
		}
		else if(this.state == this.STATE_DISPLAY_FLASH_GROUP) {
			if(elapsedTime > this.displayTimer) {
				this.setGroupLights(function(light, arrayIndex, c) {
					light.reset();
					light.set(c.r, c.g, c.b, c.a);
				});
				this.displayNextGroupLight(elapsedTime);
			}
		}
		else if(this.state == this.STATE_DISPLAY_COLLECT_GROUP_START) {
			this.state = this.STATE_DISPLAY_COLLECT_GROUP;
		}
		else if(this.state == this.STATE_DISPLAY_COLLECT_GROUP) {
			if(elapsedTime > this.displayTimer) {

				var self = this;
				this.setGroupLights(function(light, arrayIndex, c) {
					if(self.displayGoalLightIndex == arrayIndex) {
						light.fadeOut(self.TIME_GROUP_LIGHT_FADE_OUT);
					}
				});

				this.displayGoalLightIndex++;

				if(this.displayGoalLightIndex > this.getCurrentGoal().entries.length) {
					// finished
					this.state = this.STATE_DISPLAY_FADE_GROUP;
					this.displayTimer = elapsedTime + this.TIME_BETWEEN_GROUPS;
					this.displayGoalLightIndex = 0;
				}
				else {
					this.displayNextGroupLight(elapsedTime);
				}
			}
		}
		else if(this.state == this.STATE_DISPLAY_FADE_GROUP) {
			if(elapsedTime > this.displayTimer) {
				this.displayGoalIndex++;
				if(this.displayGoalIndex == this.goalGroups.length) {
					this.state = this.STATE_DISPLAY_COMPLETE;
				}
				else {
					this.displayNextGroup(elapsedTime);
				}
			}
		}
		else if(this.state == this.STATE_DISPLAY_COMPLETE) {
			this.currentGoalIndex = 0;
			_.each(this.lights, function(light) {
				light.reset();
			});
			this.displayingGoalsComplete = [];
			this.goalGroups = [];
			this.setCurrentFlashing();
			this.state = this.STATE_COLLECTING;
		}
	}
});