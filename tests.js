QUnit.test("diamond test", function(assert) {

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

	diamond.update(0.1, 0.1);

	assert.ok(diamond.canCollect() == false, "after update collect");
	assert.ok(diamond.isCollectComplete() == false, "after update collect complete");

	diamond.completedGoal(1);

	assert.equal(diamond.currentGoalIndex, 1, "should be increased");
});