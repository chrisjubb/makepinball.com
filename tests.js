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
		lightState.push(new Pin.Light());
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
	var diamond = new Game.Diamond(lightState, 10, 25, currentPulseColour, centerDiamondData);

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
	assert.equal(diamond.state, diamond.STATE_DISPLAYING, "should be displaying now");

	doUpdate(diamond, 10.0);
	assert.equal(diamond.state, diamond.STATE_DISPLAY_COMPLETE, "should be complete now");
	assert.ok(diamond.isCollectComplete(), "collect should be complete");
	assert.ok(diamond.canCollect() == false, "haven't completed any");

	diamond.collect();
	assert.equal(diamond.state, diamond.STATE_DISPLAY_COMPLETE, "should go straight to complete");
	assert.ok(diamond.isCollectComplete(), "collect should be complete");
	assert.ok(diamond.canCollect() == false, "haven't completed any");
	doUpdate(diamond);

	assert.ok(diamond.isCollectComplete() == false, "should be back to collecting");
	assert.ok(diamond.canCollect() == false, "haven't completed any");
});