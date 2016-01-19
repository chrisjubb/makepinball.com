define(["jclass", "underscore"], function(JClass, _) {

return JClass.extend({

	// when comes on and then only activated again once the switch is deactivated
	triggerOnList: [],

	waitingForSwitchOff: [],

	triggerOn: function(idList, callbackContext, callbackFunction) {
		var self = this;
		_.each(idList, function(id) {
			if(self.triggerOnList[id] === undefined) {
				self.triggerOnList[id] = [];
			}

			self.triggerOnList[id].push({ fn: callbackFunction, context: callbackContext });
		});
	},


	update: function(switchState) {
		var self = this;
		_.each(this.triggerOnList, function(list, listIndex) {
			if(list) {
				if(self.waitingForSwitchOff[listIndex] !== undefined) {
					if(!switchState[listIndex]) {
						self.waitingForSwitchOff[listIndex] = undefined;
					}
				}
				else {
					if(switchState[listIndex]) {
						self.waitingForSwitchOff[listIndex] = true;
						_.each(list, function(callbackItem) {
							callbackItem.fn.call(callbackItem.context);
						});
					}
				}
			}
		});
	}
});

}); // require