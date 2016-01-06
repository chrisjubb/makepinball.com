var Pin = Pin || {};

Pin.SoundManager = Class.extend({
	soundId: 0,

	load: function(path) {
		var createdSoundId = this.soundId;
		createjs.Sound.registerSound(path, this.soundId);
		this.soundId++;

		return createdSoundId;
	},

	play: function(soundId) {
		createjs.Sound.play(soundId);
	}
});
