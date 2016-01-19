define(["jclass"], function(JClass) {

return JClass.extend({
	soundId: 0,
	soundsLoaded: [],
	playWhenLoaded: [], // callback

	init: function() {
		var self = this;
		createjs.Sound.on("fileload", function(evt) {
			var id = evt.id;
			self.soundsLoaded[id] = true;

			if(self.playWhenLoaded[id]) {
				var callback = self.playWhenLoaded[id];
				self.playWhenLoaded[id] = undefined;
				self.play(id, callback);
			}
		});
	},

	load: function(path) {
		var createdSoundId = this.soundId;
		createjs.Sound.registerSound(path, this.soundId);
		this.soundId++;

		return createdSoundId;
	},

	play: function(soundId, callback) {
		if(this.soundsLoaded[soundId]) {
			var instance = createjs.Sound.play(soundId);
			if(callback) {
				callback(instance);
			}
		}
		else {
			this.playWhenLoaded[soundId] = callback;
		}
	}
});

}); // require