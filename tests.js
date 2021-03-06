requirejs.config({
	paths: {
		jquery: 	"lib/jquery",
		underscore: "lib/underscore",
		backbone: 	"lib/backbone",
		jclass: 	"lib/jclass",

		config_model: 			"config/config_model",
		config_view: 			"config/config_view",
		config_view_element: 	"config/config_view_element"
	},

	shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        jclass: {
        	exports: "JClass"
        }
    }
});

require(["underscore", "backbone", "game", "light", "game_diamond"],
function(_, Backbone, Game, Light, Diamond) {
	// Hmm - requirejs doesn't seem to load this properly.
	Backbone.$ = $;

	QUnit.test("diamond test", function(assert) {

		var defaultDelta = 0.1;
		var elapsedTime = 0.0;
		var doUpdate = function(d, delta) {
			if(delta === undefined) {
				delta = defaultDelta;
			}
			elapsedTime += delta;
			d.update(delta, elapsedTime);
		}

		var lightState = [];
		for(var i = 0; i < 100; ++i) {
			lightState.push(new Light());
		}

		var colour = { r: 1, g: 1, b: 0, a: 1 };
		var currentPulseColour = {r: 0.7, g: 0.7, b: 0.7, a: 1.0};
		var centerDiamondData = [
			{ colour: colour },
			{ colour: colour },
			{ colour: colour },
			{ colour: colour },
			{ colour: colour }
		];
		var diamond = new Diamond(lightState, 10, 25, currentPulseColour, centerDiamondData);

		assert.ok(diamond.canCollect() == false, "inital collect");
		assert.ok(diamond.isCollectComplete() == false, "inital collect complete");
		assert.equal(diamond.currentGoalIndex, 0, "initial should be 0");

		doUpdate(diamond);

		assert.ok(diamond.canCollect() == false, "after update collect");
		assert.ok(diamond.isCollectComplete() == false, "after update collect complete");

		diamond.completedGoal(1);

		assert.equal(diamond.currentGoalIndex, 1, "should be increased");
		doUpdate(diamond);

		diamond.collect(elapsedTime);
		assert.ok(diamond.canCollect() == false, "just collected all");
		doUpdate(diamond);
		assert.equal(diamond.currentGoalIndex, 0, "should have been reset");
		assert.equal(diamond.goalsComplete.length, 0, "should have none");
		assert.equal(diamond.displayingGoalsComplete.length, 1, "should have one");

		doUpdate(diamond);
		assert.equal(diamond.state, diamond.STATE_DISPLAY_START, "should be displaying now");

		var diamond0 = new Diamond(lightState, 10, 25, currentPulseColour, centerDiamondData);
		diamond0.collect();
		assert.equal(diamond0.state, diamond0.STATE_DISPLAY_COMPLETE, "should go straight to complete");
		assert.ok(diamond0.isCollectComplete(), "collect should be complete");
		assert.ok(diamond0.canCollect() == false, "haven't completed any");
		doUpdate(diamond0);

		assert.ok(diamond0.isCollectComplete() == false, "should be back to collecting");
		assert.ok(diamond0.canCollect() == false, "haven't completed any");

		// group building:
		var diamond1 = new Diamond(lightState, 10, 25, currentPulseColour, centerDiamondData);
		var groups0 = diamond1.buildGroups(diamond1.displayingGoalsComplete);
		assert.equal(groups0.length, 0, "should have no groups");

		diamond1.completedGoal(4);
		diamond1.collect();
		var groups1 = diamond1.buildGroups(diamond1.displayingGoalsComplete);
		assert.equal(groups1.length, 1, "should just have one group");
		assert.equal(groups1[0].goalIndex, 4, "should be goal index 4");
		assert.equal(groups1[0].entries.length, 1, "should just have one entry");
		assert.equal(groups1[0].entries[0], 0, "should just be the first index");

		var diamond2 = new Diamond(lightState, 10, 25, currentPulseColour, centerDiamondData);
		diamond2.completedGoal(3);
		diamond2.completedGoal(4);
		diamond2.completedGoal(3);
		diamond2.collect();
		var groups2 = diamond2.buildGroups(diamond2.displayingGoalsComplete);
		assert.equal(groups2.length, 2, "two groups");
		assert.equal(groups2[0].goalIndex, 3, "should have one of 3 goal index and one of 4");
		assert.equal(groups2[1].goalIndex, 4, "should have one of 3 goal index and one of 4");
		assert.equal(groups2[0].entries.length, 2, "two 5s are connected");
		assert.equal(groups2[1].entries.length, 1, "only one 6");
		assert.equal(groups2[0].entries[0], 0, "should have 0 and 2");
		assert.equal(groups2[0].entries[1], 2, "should have 0 and 2");
		assert.equal(groups2[1].entries[0], 1, "should have 1");

		var groups3 = diamond2.buildGroups([3,4,3,4,3,4]); // can build independantly
		assert.equal(groups3.length, 3, "group of 3, 4 and another 4");
		assert.equal(groups3[0].goalIndex, 3, "should have one of 3 goal index and two of 4");
		assert.equal(groups3[1].goalIndex, 4, "should have one of 3 goal index and two of 4");
		assert.equal(groups3[2].goalIndex, 4, "should have one of 3 goal index and two of 4");
		assert.deepEqual(groups3[0].entries, [0, 2, 4], "three 3s are connected");
		assert.deepEqual(groups3[1].entries, [1, 3], "two 4s are connected");
		assert.deepEqual(groups3[2].entries, [5], "two 4s are connected");

		var groups4 = diamond2.buildGroups([2,2,2,3,2,5]);
		assert.equal(groups4.length, 3, "group of 2, 3 and a 5");
		assert.equal(groups4[0].goalIndex, 2, "should have one of 2 goal index, one of 3 and one of 5");
		assert.equal(groups4[1].goalIndex, 3, "should have one of 2 goal index, one of 3 and one of 5");
		assert.equal(groups4[2].goalIndex, 5, "should have one of 2 goal index, one of 3 and one of 5");
		assert.deepEqual(groups4[0].entries, [0, 1, 2, 4], "four 2s are connected");
		assert.deepEqual(groups4[1].entries, [3], "one 3");
		assert.deepEqual(groups4[2].entries, [5], "one 5");

		var groups5 = diamond2.buildGroups([3,3,3,3,3, 3,3,3,3,3, 3,3,3,3,3, 3]);
		assert.equal(groups5.length, 1, "just one group of 3");
		assert.equal(groups5[0].goalIndex, 3, "should have one of 3 goal index");
		assert.deepEqual(groups5[0].entries, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "one 3");
	});


});