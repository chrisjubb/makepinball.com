define(function() {

return {
	radians: function(degrees) {
		return degrees * Math.PI / 180;
	},

	degrees: function(radians) {
		return radians * 180 / Math.PI;
	},

	lerp: function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    },

    sin01: function(value) {
    	return (Math.sin(value) + 1.0) * 0.5;
    }
};

}); // require