var Pin = Pin || {};

Pin.Utils = {
	dpos: function(pos) {
		if(pos) {
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

	distanceSq: function(a, b) {
		var dataA = convertToVector3(a);
		var dataB = convertToVector3(b);

		return dataA.distanceToSquared(dataB);
	}
};
