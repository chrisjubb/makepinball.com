define(["jclass"], function(JClass) {

// intentionall empty at the moment - todo - send a sound message over a websocket to the display web application.

return JClass.extend({
	soundId: 0,

	init: function() {
	},

	load: function(path) {
		var createdSoundId = this.soundId;
		this.soundId++;
		return createdSoundId;
	},

	play: function(soundId, callback) {
		console.log("wants to play soundId");
	}
});

}); // require