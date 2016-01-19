define(["underscore", "backbone", "config_view_element"], function(_, Backbone, ConfigViewElement) {

return Backbone.View.extend({
	inputModels: [],

	render: function() {
		this.$el.empty();
		this.inputModels = [];

		var self = this;
		this.model.ready(function() {
			self.$el.append("<form></form>");
			var $form = self.$el.find("form");

			_.each(self.model.getConfig(), function(entry) {
				var element = new ConfigViewElement({ model: entry, configAndSettings: self.model });
				$form.append(element.render().el);
				element.update();
				self.inputModels.push(element);
			});
		});

		return this;
	},

	updateValues: function() {
		_.each(this.inputModels, function(input) {
			input.update();
		});
	}
});

}); // define

