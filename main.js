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

require(["underscore", "backbone", "config_model", "config_view", "game", "view", "event_switch"],
function(_, Backbone, ConfigModel, ConfigView, Game, View, EventSwitch) {

	// Hmm - requirejs doesn't seem to load this properly.
	Backbone.$ = $;

	if(!Detector.webgl) Detector.addGetWebGLMessage();

	var game = new Game();
	var view = new View();

	var debugSwitchButtonsShown = false;
	var debugSwitches = [];
	var oldSwitchState;
	var differentSwitchState = [];
	var eventOutput = $("#eventTextArea");
	var events = [];
	var replayingEvents = false;
	var replayingEventsCounter = 0;
	updateEvents();

	view.setLightShader("light_vertex_shader", "light_fragment_shader");
	view.setFlipperData(game.getFlipperData());
	view.setInputMapping(game.getInputMapping());
	view.setForceSwitchData(game.getForceSwitchData());

	// BLENDER -> THREE
	// XYZ     -> +X +Z -Y

	function getCanvasContainer() {
		return $("#canvasContainer");
	}

	// physics config
	var physCfg = new ConfigModel().load("physics.config.json", "physics.settings.json");
	var physCfgView = new ConfigView({ model: physCfg });
	$("#config").html(physCfgView.render().el);

	// config related
	function configHide() {
		$("#configContainer").css("width", "0%");
		getCanvasContainer().css("width", "100%");
		onWindowResize();
	}

	function configOutputJson() {
		console.log(JSON.stringify(physCfg.getSettings()));
	}

	function configUpdate() {
		physCfgView.updateValues();
		view.initPhysics();
	}

	function debugSwitchDown(switchIndex) {
		debugSwitches[switchIndex] = 1;
	}

	function debugSwitchUp(switchIndex) {
		debugSwitches[switchIndex] = 0;
	}

	function updateDebugSwitchState(switchState) {
		_.each(debugSwitches, function(debugSwitch, debugSwitchIndex) {
			if(debugSwitch) {
				switchState[debugSwitchIndex] = 1;
			}
		});

		return switchState;
	}

	function updateGameSwitchEvents(switchState) {
		if(replayingEvents == false) {
			// don't relog events if we're replaying
			if(oldSwitchState) {
				var differences = 0;
				_.each(switchState, function(switchItem, switchIndex) {
					if(switchItem !== undefined &&
						switchItem != oldSwitchState[switchIndex]) {
						differentSwitchState[switchIndex] = switchItem;
						differences++;
					}
					else {
						differentSwitchState[switchIndex] = undefined;
					}
				});
				if(differences > 0) {
					logSwitchChange(differentSwitchState);
				}
			}

			oldSwitchState = _.clone(switchState);
		}
	}

	function logSwitchChange(changedSwitches) {
		_.each(changedSwitches, function(switchItem, switchIndex) {
			if(switchItem !== undefined) {
				events.push(new EventSwitch(view.getElapsedTime(), switchIndex, switchItem));
			}
		});
		updateEvents();
	}

	function clearEvents() {
		events = [];
		updateEvents();
	}

	function replayEvents() {
		replayingEvents = true;
		replayingEventsCounter = 0;
	}

	function updateEvents() {
		eventOutput.html(JSON.stringify(events));
	}

	function updateReplaying(switchState) {
		if(replayingEvents) {
			events[replayingEventsCounter].perform(debugSwitches);
			replayingEventsCounter++;
			if(replayingEventsCounter == events.length) {
				replayingEvents = false;
			}
		}
	}

	function toggleSwitchButtons() {
		var switchPositions = view.getSwitchPositionsScreen();
		var container = $("#debugSwitchContainer");
		container.empty();

		if(!debugSwitchButtonsShown) {
			_.each(switchPositions, function(switchData, switchIndex) {
				if(switchData) {
					var switchButton = $("<button class='debugSwitchButton' switchIndex='" + switchIndex + "''>" + switchIndex + "</button>");
					container.append(switchButton);
					switchButton.css("left", switchData.x - 10);
					switchButton.css("top", switchData.y - 5);
					switchButton.mousedown(function(evt) {
						debugSwitchDown(parseInt($(evt.target).attr("switchIndex")));
					});
					switchButton.mouseup(function(evt) {
						debugSwitchUp(parseInt($(evt.target).attr("switchIndex")));
					});
				}
			});
			debugSwitchButtonsShown = true;
		}
		else {
			debugSwitchButtonsShown = false;
		}
	}

	function onWindowResize() {
		view.onResize();
	}

	window.addEventListener('resize', onWindowResize, false);

	window.addEventListener( 'keyup', function(evt) {
		if(evt.keyCode == 83) { // S
			toggleSwitchButtons();
		}
	}, false );

	function animate() {
		requestAnimationFrame(animate);

		view.preUpdate();
		var switchState = view.getSwitchState();
		updateReplaying(switchState);
		switchState = updateDebugSwitchState(switchState);
		updateGameSwitchEvents(switchState);
		game.update(switchState, view.getElapsedTime(), view.getDeltaTime());
		var lightState = game.getLightState();
		var forceState = game.getForceState();
		var forceFromSwitchState = game.getForceFromSwitchState();
		var forceFromCenterAndSwitchState = game.getForceFromCenterAndSwitchState();
		var deactivateFromSwitchState = game.getDeactivateFromSwitchState();
		var activateFromSwitchState = game.getActivateFromSwitchState();
		view.update(lightState,
					forceState,
					forceFromSwitchState,
					forceFromCenterAndSwitchState,
					deactivateFromSwitchState,
					activateFromSwitchState);
		view.render();
		stats.update();
	}

	physCfg.ready(function() {
		view.setPhysicsConfig(physCfg);
		view.load(getCanvasContainer());
	});

	view.ready(function() {
		animate();
	});

	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	getCanvasContainer().append(stats.domElement);

});