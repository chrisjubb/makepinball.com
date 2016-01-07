var Pin = Pin || {};

Pin.Utils = {
	dpos: function(pos) {
		if(pos) {
			pos = this.convertToVector3(pos);
			return "[ " + pos.x + ", " + pos.y + ", " + pos.z + " ]";
		}
		else {
			return '[not valid]';
		}
	},

	radians: function(degrees) {
		return degrees * Math.PI / 180;
	},

	degrees: function(radians) {
		return radians * 180 / Math.PI;
	},

	convertToVector3: function(vec) {
		if(vec instanceof Ammo.btVector3) {
			return new THREE.Vector3(vec.x(), vec.y(), vec.z());
		}
		else if(vec instanceof THREE.Vector3) {
			return vec;
		}
		else if(vec instanceof Object) {
			return new THREE.Vector3(vec.x, vec.y, vec.z);
		}
		else {
			return undefined;
		}
	},

	convertToAmmoVector3: function(vec) {
		return new Ammo.btVector3(vec.x, vec.y, vec.z);
	},

	distanceSq: function(a, b) {
		var dataA = this.convertToVector3(a);
		var dataB = this.convertToVector3(b);

		return dataA.distanceToSquared(dataB);
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
