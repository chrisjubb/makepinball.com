define(["jclass"], function(JClass) {

return JClass.extend({
	elapsedTime: undefined,

	init: function(elapsedTime) {
		this.elapsedTime = elapsedTime.toFixed(2);
	},

	perform: function(switchState) {
		console.error("Override me");
	}
});

}); // require