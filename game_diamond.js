var Game = Game || {};

Game.Diamond = Class.extend({

	lights: [],
	colourLookup: undefined, // array of bank index -> colour r,g,b,a
	currentGoalIndex: 0,
	goalsComplete: [],
	displayingGoalsComplete: [], // when animating the collection, use this.
	state: undefined,
	displayTimer: 0.0,

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
	STATE_DISPLAY_COLLECT_GROUP: 2, // run through a group,
	STATE_DISPLAY_FADE_GROUP: 3, // fade out the group -> STATE_DISPLAY_COLLECT_GROUP
	STATE_DISPLAY_COMPLETE: 4,

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
				this.state = this.STATE_DISPLAY_START;
				this.currentGoalIndex = 0;
				this.displayingGoalsComplete = _.clone(this.goalsComplete);
				this.goalGroups = this.buildGroups(this.displayingGoalsComplete);
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

	buildGroups: function(goalsComplete) {
		// take the goalsComplete list and build a list of groups from it
		var groups = [];
		// if we have used this position to build a group
		var usedPositionIndices = [];

		var self = this;
		_.each(goalsComplete, function(goalIndex, positionIndex) {
			if(	goalIndex &&
				usedPositionIndices[positionIndex] === undefined) {

				var group = {goalIndex: goalIndex, entries: []};
				self.buildGroupGivenPosition(	goalsComplete,
												goalIndex,
												positionIndex,
												group.entries,
												usedPositionIndices);

				group.entries = _.union(group.entries);
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

	update: function(deltaTime, elapsedTime) {
		if(this.state == this.STATE_DISPLAY_START) {
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