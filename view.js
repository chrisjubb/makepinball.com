var Pin = Pin || {};

Pin.View = Class.extend({
	clock: undefined,
	deltaTime: undefined,

	readyCallbacks: [],

	switchState: [],
	flipperData: [],
	inputMapping: [],
	forceSwitchData: [],

	lightVertexShader: undefined,
	lightFragmentShader: undefined,

	camera: undefined,
	scene: undefined,
	renderer: undefined,
	dae: undefined,

	addDebugging: false,

	physCfg: undefined,

	// effects
	depthMaterial: undefined,
	effectComposer: undefined,
	depthRenderTarget: undefined,
	ssaoPass: undefined,
	group: undefined,
	depthScale: 1.0,
	ssaoEnabled: false,
	shadowsEnabled: true,

	// physics state - could turn into a class
	dynamicsWorld: undefined,
	physicsMeshCallbacks: [],
	planeBodies: [],
	triangleMeshBodies: [],
	ballBodies: [],
	flipperBodies: [],
	ballStartingData: [],
	flipperConstraints: [],
	switchBodies: [],
	forceData: [],
	lightObjects: [],

	switchToBodyPtrLookup: {}, // Ammo body ptr -> switch index.
	switchOrientationVectors: [], // switch index -> Ammo.btVector3 of the switch orientation.

	groupPlane: 1,
	groupTriangleMesh: 2,
	groupBall: 4,
	groupFlipper: 8,
	groupSwitch: 32,

	init: function() {
		this.clock = new THREE.Clock();

		// plane -> ball only
		this.maskPlane = this.groupBall;
		// triangle mesh -> ball only
		this.maskTriangleMesh = this.groupBall;
		// ball -> plane, triangle mesh, flipper, other balls
		this.maskBall = this.groupPlane +
						this.groupTriangleMesh +
						this.groupFlipper +
						this.groupBall +
						this.groupSwitch;
		// flipper -> ball
		this.maskFlipper = this.groupBall;
		// ghost -> ball
		this.maskSwitch = this.groupBall;
	},

	setPhysicsConfig: function(physCfg) {
		this.physCfg = physCfg;
	},

	ready: function(readyFunction) {
		this.readyCallbacks.push(readyFunction);
	},

	load: function(canvasContainer) {
		this.canvasContainer = canvasContainer;

		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;

		var self = this;
		loader.load('output.dae', function(collada) {
			self.dae = collada.scene;

			self.dae.traverse(function(child) {
				var castShadow = true;
				if(child.name.indexOf("PLANE_") == 0) {
					castShadow = false; // no point
				}

				if(child instanceof THREE.SkinnedMesh) {
					var animation = new THREE.Animation(child, child.geometry.animation);
					animation.play();
				}

				child.castShadow = castShadow;
			    child.receiveShadow = true;
			});

			self.dae.scale.x = self.dae.scale.y = self.dae.scale.z = 1.0;
			self.dae.updateMatrix();

			self.initPhysics();
			self.initScene();

			_.each(self.readyCallbacks, function(callback) {
				callback();
			})
			self.readyCallbacks = [];
		});
	},

	getSwitchState: function() {
		return this.switchState;
	},

	setLightShader: function(vertexShaderId, fragmentShaderId) {
		this.lightVertexShader		= document.getElementById(vertexShaderId).textContent;
		this.lightFragmentShader	= document.getElementById(fragmentShaderId).textContent;
	},

	setFlipperData: function(flipperData) {
		this.flipperData = flipperData;
	},

	setInputMapping: function(inputMapping) {
		this.inputMapping = inputMapping;
	},

	setForceSwitchData: function(forceSwitchData) {
		this.forceSwitchData = forceSwitchData;
	},

	preUpdate: function() {
		var self = this;

		this.deltaTime = this.clock.getDelta();
		THREE.AnimationHandler.update(this.deltaTime);

		_.each(this.switchBodies, function(switchBody, switchIndex) {
			if(switchBody) {
				self.switchState[switchIndex] = 0;
			}
		});

		this.switchActivatedByBodies = [];

		var dispatcher = this.dynamicsWorld.getDispatcher();
		for(var i = 0, n = dispatcher.getNumManifolds(); i < n; ++i) {
			var manifold = dispatcher.getManifoldByIndexInternal(i);

			// A ghost object
			if(manifold.getBody1().getCollisionFlags() == 4) {
				var switchIndex = this.getSwitchFromBodyPtr(manifold.getBody1().ptr);
				if(switchIndex) {
					var activateSwitch = true;

					var ballBody = _.find(this.ballBodies, function(ballBody) {
						return (manifold.getBody0().ptr == ballBody.ptr);
					});

					if(self.switchActivatedByBodies[switchIndex] == undefined) {
						self.switchActivatedByBodies[switchIndex] = [];
					}
					var velocity = ballBody.getLinearVelocity().length();
					var switchVector = self.switchOrientationVectors[switchIndex];
					var velocityNormalized = new Ammo.btVector3(ballBody.getLinearVelocity().x(),
																ballBody.getLinearVelocity().y(),
																ballBody.getLinearVelocity().z());
					velocityNormalized.normalize();
					var dotProduct = velocityNormalized.dot(switchVector);
					self.switchActivatedByBodies[switchIndex].push( {body: ballBody,
																	 velocity: velocity,
																	 dotProduct: dotProduct });

					// if there is a force switch data associated - check it's still valid
					var forceSwitchDataItem = self.forceSwitchData[switchIndex];
					if(forceSwitchDataItem) {
						if(velocity < forceSwitchDataItem.forceRequired) {
							activateSwitch = false;
						}
						// todo - remove this abs and get it working one side only
						if(Math.abs(dotProduct) < forceSwitchDataItem.minDotProduct) {
							activateSwitch = false;
						}
					}

					if(activateSwitch) {
						self.switchState[switchIndex] = 1;
					}
				}
			}
		}
	},

	update: function(	lightState,
						forceState,
						forceFromSwitchState,
						forceFromCenterAndSwitchState,
						deactivateFromSwitchState,
						activateFromSwitchState) {
		var self = this;
		_.each(forceState, function(forceValue, forceId) {
			if(forceValue) {
				self.activateForceOnBall(forceId);
			}
		});

		_.each(forceFromSwitchState, function(forceValue, forceSwitchIndex) {
			if(forceValue) {
				var bodyData = self.switchActivatedByBodies[forceSwitchIndex];
				if(bodyData) {
					_.each(bodyData, function(bodyDataItem) {
						self.activateForce(forceSwitchIndex, bodyDataItem.body, false);
					});
				}
			}
		});

		_.each(forceFromCenterAndSwitchState, function(forceValue, forceSwitchIndex) {
			if(forceValue) {
				var bodyData = self.switchActivatedByBodies[forceSwitchIndex];
				if(bodyData) {
					_.each(bodyData, function(bodyDataItem) {
						self.activateForce(forceSwitchIndex, bodyDataItem.body, true);
					});
				}
			}
		});

		_.each(deactivateFromSwitchState, function(deactivateValue, switchIndex) {
			if(deactivateValue) {
				var bodyData = self.switchActivatedByBodies[switchIndex];
				if(bodyData) {
					_.each(bodyData, function(bodyDataItem) {
						// deactivate
						bodyDataItem.body.setMassProps(0, new Ammo.btVector3(0,0,0));
					});
				}
			}
		});

		_.each(activateFromSwitchState, function(activateValue, switchIndex) {
			if(activateValue) {
				var bodyData = self.switchActivatedByBodies[switchIndex];
				if(bodyData) {
					_.each(bodyData, function(bodyDataItem) {
						// activate
						bodyDataItem.body.setMassProps(physCfg.get("ballMass"), new Ammo.btVector3(0,0,0));
					});
				}
			}
		});

		_.each(this.flipperData, function(flipperData) {
			self.processFlipper(self.flipperBodies[flipperData.flipperBodyIndex],
								self.switchState[flipperData.switchIndex],
								flipperData.directionMultiplier);
		});

		this.dynamicsWorld.stepSimulation(this.deltaTime, 2);
		_.each(this.physicsMeshCallbacks, function(callback) {
			callback();
		});

		_.each(lightState, function(lightData, lightIndex) {
			if(lightData) {
				var lightObject = self.lightObjects[lightIndex];
				if(lightObject) {
					_.each(lightObject.children, function(child) {
						child.material.uniforms.backgroundTint.value.set(
							lightData.r(),
							lightData.g(),
							lightData.b(),
							lightData.a()
						);
						child.material.needsUpdate = true;
					});
				}
			}
		});
	},

	getDeltaTime: function() {
		return this.deltaTime;
	},

	getElapsedTime: function() {
		return this.clock.elapsedTime;
	},

	getCanvasContainer: function() {
		return this.canvasContainer;
	},

	// blender export related
	getNameIndex: function(child, stringIdent) {
		if(child.name.indexOf(stringIdent) == 0) {
			var idString = child.name.substring(stringIdent.length);
			var id = parseInt(idString);
			return {id: id, child: child};
		}

		return undefined;
	},

	initPhysics: function() {
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
	    var overlappingPairCache = new Ammo.btDbvtBroadphase();
	    var solver = new Ammo.btSequentialImpulseConstraintSolver();

	    var tableAngle = this.physCfg.get("tableAngle");
	    var gravityForce = this.physCfg.get("gravityForce");

	    var gravityVector = new THREE.Vector3(0, 1, 0);
	    var gravityRotation = new THREE.Quaternion();
	    gravityRotation.setFromEuler(new THREE.Euler(Pin.Utils.radians(tableAngle), 0, 0));
	    gravityVector = gravityVector.applyQuaternion(gravityRotation);
	    gravityVector.normalize();
	    gravityVector.multiplyScalar(gravityForce);

	    console.log("tableAngle = " + tableAngle + ", vector = " + Pin.Utils.dpos(gravityVector));

	    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	    this.dynamicsWorld.setGravity(new Ammo.btVector3(gravityVector.x,
	    											gravityVector.y,
	    											gravityVector.z));

	    this.resetBallPositions();

	    this.physicsMeshCallbacks = [];
	    this.planeBodies = [];
	    this.triangleMeshBodies = [];
	    this.ballBodies = [];
	    this.flipperBodies = [];
	    this.ballStartingPositions = [];
	    this.flipperConstraints = [];
	    this.switchBodies = [];
	    this.forceData = [];
	    this.lightObjects = [];

	    var planes = [];
		var triangleMeshes = [];
		var triangleMeshesVisual = [];
		var balls = [];
		var flippers = [];
		var switches = [];
		var forces = [];
		var lights = [];

		var self = this;
		this.dae.traverse(function(child) {
			// console.log(child.name + " - " + dpos(child.position));

			if(child.name.indexOf("PLANE_") == 0) {
				planes.push(child);
			}

			if(child.name.indexOf("P_") == 0) {
				triangleMeshes.push(child);
			}

			if(child.name.indexOf("PV_") == 0) {
				triangleMeshesVisual.push(child);
			}

			if(child.name.indexOf("BALL") == 0) {
				balls.push(child);
			}

			var flipper = self.getNameIndex(child, "FLIPPER_");
			if(flipper) {
				flippers[flipper.id] = flipper.child;
			}

			var switchObject = self.getNameIndex(child, "SWITCH_")
			if(switchObject) {
				switches[switchObject.id] = switchObject.child;
			}

			var forceObject = self.getNameIndex(child, "FORCE_")
			if(forceObject) {
				forces[forceObject.id] = forceObject.child;
			}

			var lightObject = self.getNameIndex(child, "LIGHT_");
			if(lightObject) {
				lights[lightObject.id] = lightObject.child;
			}
		} );

		_.each(planes, function(child) {
			console.log("[!] Adding plane");
			self.planeBodies.push(self.addPlane(child));
		});

		_.each(triangleMeshes, function(child) {
			console.log("[!] Adding triangle mesh - " + child.name);
			child.visible = false;
			self.triangleMeshBodies.push(self.addTriangleMesh(child));
		});

		_.each(triangleMeshesVisual, function(child) {
			console.log("[!] Adding triangle mesh with visuals - " + child.name);
			self.triangleMeshBodies.push(self.addTriangleMesh(child));
		});

		_.each(balls, function(child) {
			console.log("[!] Adding ball (" + child.name + ") - " + Pin.Utils.dpos(child.position));
			var ballBody = self.addBall(child);
			self.ballBodies.push(ballBody);
			self.ballStartingData.push({ position: child.position.clone(), child: child });
		});

		_.each(flippers, function(child, flipperIndex) {
			console.log("[!] Adding flipper");
			self.flipperBodies.push(self.addFlipper(child, flipperIndex));
		});

		_.each(switches, function(child, switchIndex) {
			console.log("[!] Adding switch");
			if(child) {
				self.switchBodies[switchIndex] = self.addSwitch(child, switchIndex);
			}
		});

		_.each(forces, function(child, forceIndex) {
			console.log("[!] Adding force");
			if(child) {
				self.forceData[forceIndex] = self.addForce(child, forceIndex);
			}
		});

		_.each(lights, function(child, lightIndex) {
			if(child) {
				self.lightObjects[lightIndex] = self.addLight(child, lightIndex);
			}
		});

		this.resetBallPositions();
	},

	resetBallPositions: function() {
		var self = this;
		_.each(this.ballBodies, function(body, i) {
			var transform = new Ammo.btTransform();
			transform.setIdentity();
			var startingData = self.ballStartingData[i];
			var pos = startingData.position;
			var mass = this.physCfg.get("ballMass");

			// reset the visual part
			startingData.child.position = startingData.position.clone();

			transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
			body.setWorldTransform(transform);
			body.setLinearVelocity(new Ammo.btVector3(0,0,0));
			body.setAngularVelocity(new Ammo.btVector3(0,0,0));
			body.setMassProps(mass, new Ammo.btVector3(0,0,0));
		});
	},

	addBodyPhysicsConfig: function(bodyRef, configNameStart) {
		bodyRef.setRestitution(	this.physCfg.get(configNameStart + "Restitution"));
	    bodyRef.setDamping(		this.physCfg.get(configNameStart + "DampingLinear"), this.physCfg.get(configNameStart + "DampingAngular"));
	   	bodyRef.setFriction(	this.physCfg.get(configNameStart + "Friction"));
	},

	addTriangleMesh: function(original) {
		var physicsMesh = new Ammo.btTriangleMesh();

		original.updateMatrixWorld();

		var mesh = original.children[0];
		var geometry = mesh.geometry;
		_.each(geometry.faces, function(face) {

			var localV0 = geometry.vertices[face.a];
			var localV1 = geometry.vertices[face.b];
			var localV2 = geometry.vertices[face.c];

			var worldV0 = original.localToWorld(localV0.clone());
			var worldV1 = original.localToWorld(localV1.clone());
			var worldV2 = original.localToWorld(localV2.clone());

			physicsMesh.addTriangle(
							new Ammo.btVector3(worldV0.x, worldV0.y, worldV0.z),
							new Ammo.btVector3(worldV1.x, worldV1.y, worldV1.z),
							new Ammo.btVector3(worldV2.x, worldV2.y, worldV2.z)
							);
		});

		var shape = new Ammo.btBvhTriangleMeshShape(physicsMesh, true, true);

		var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(0, 0, 0));

	    var mass = 0;
	    var localInertia = new Ammo.btVector3(0, 0, 0);
	    shape.calculateLocalInertia(mass, localInertia);

	    var motionState = new Ammo.btDefaultMotionState(transform);
	    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	    var body = new Ammo.btRigidBody(rigidBodyInfo);
	    this.addBodyPhysicsConfig(body, "triangleMesh");
	    this.dynamicsWorld.addRigidBody(body, this.groupTriangleMesh, this.maskTriangleMesh);
	    body.activate();

	    return body;
	},

	addBall: function(original) {
		var pos = original.position.clone();
	    var rot = new THREE.Quaternion();
	    rot.setFromEuler(original.rotation);

	    var shape = new Ammo.btSphereShape(original.scale.x * 0.1);
	    shape.setMargin(0.04);
	    var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

	    var mass = this.physCfg.get("ballMass");
	    var localInertia = new Ammo.btVector3(0, 0, 0);
	    shape.calculateLocalInertia(mass, localInertia);

	    var motionState = new Ammo.btDefaultMotionState(transform);
	    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	    var body = new Ammo.btRigidBody(rigidBodyInfo);
	    this.addBodyPhysicsConfig(body, "ball");
	    body.setActivationState(4); // DISABLE_DEACTIVATION - never sleep
	    this.dynamicsWorld.addRigidBody(body, this.groupBall, this.maskBall);
	    body.activate();

	    this.addPhysicsCallback(original, body, transform);

	    return body;
	},

	addPlane: function(original) {
		var pos = original.position.clone();

		var up = new THREE.Vector3(0, 1, 0);
		var output = up.applyQuaternion(original.quaternion);
		output.normalize();

		var shape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(output.x, output.y, output.z), 0);

		var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

	    var mass = 0;
	    var localInertia = new Ammo.btVector3(0, 0, 0);
	    shape.calculateLocalInertia(mass, localInertia);

	    var motionState = new Ammo.btDefaultMotionState(transform);
	    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	    var body = new Ammo.btRigidBody(rigidBodyInfo);
	    this.addBodyPhysicsConfig(body, "plane");
	    this.dynamicsWorld.addRigidBody(body, this.groupPlane, this.maskPlane);
	    body.activate();

	    return body;
	},

	addToConvexHull: function(shape, threePosition) {
		shape.addPoint(new Ammo.btVector3(threePosition.x, threePosition.y, threePosition.z));
	},

	addFlipper: function(original, flipperIndex) {
		var shape = new Ammo.btConvexHullShape();

		var child = original.children[0]; // should be the first one
		var mesh = child;
		var geometry = mesh.geometry;
		var self = this;
		_.each(geometry.vertices, function(vertex) {
			self.addToConvexHull(shape, vertex);
		});

		// hide physics mesh
		original.children[0].visible = false;

		var pos = original.position.clone();
		var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

	    var mass = this.physCfg.get("flipperMass");
	    var localInertia = new Ammo.btVector3(0, 0, 0);
	    shape.calculateLocalInertia(mass, localInertia);

	    var motionState = new Ammo.btDefaultMotionState(transform);
	    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	    var body = new Ammo.btRigidBody(rigidBodyInfo);
	    this.addBodyPhysicsConfig(body, "flipper");
	    body.setActivationState(4); // DISABLE_DEACTIVATION
	    this.dynamicsWorld.addRigidBody(body, this.groupFlipper, this.maskFlipper);

		var hingeTransform = new Ammo.btTransform();
	    hingeTransform.setIdentity();
	    hingeTransform.setOrigin(new Ammo.btVector3(0,0.0,0));
	    var hingeQuaternion = new Ammo.btQuaternion(0,0,0,1);
	    hingeQuaternion.setEulerZYX(this.physCfg.get("flipperHingeZ"),
	    							this.physCfg.get("flipperHingeY"),
	    							this.physCfg.get("flipperHingeX"));
	    hingeQuaternion.normalize();
	    hingeTransform.setRotation(hingeQuaternion);

	    var hinge = new Ammo.btHingeConstraint(body, hingeTransform, true);
	    var limitMin = this.physCfg.get("flipperLimitsMin" + flipperIndex);
	    var limitMax = this.physCfg.get("flipperLimitsMax" + flipperIndex);

		hinge.setLimit( Pin.Utils.radians(limitMin), Pin.Utils.radians(limitMax),
						this.physCfg.get("flipperHingeSoftness"),
						this.physCfg.get("flipperHingeSpringyness"),
						this.physCfg.get("flipperHingeRelaxationFactor"));

	    this.dynamicsWorld.addConstraint(hinge);
	    this.addPhysicsCallback(original, body, transform, { rotation: [0, 1, 0], translation: [1,1,1] });

	    this.flipperConstraints.push(hinge);

	    body.activate();

	    return body;
	},

	addSwitch: function(original, switchIndex) {
		var pos = original.position.clone();
	    var rot = new THREE.Quaternion();
	    rot.setFromEuler(original.rotation);

	    var shape;

	    var mesh = original.children[0];
		var geometry = mesh.geometry;
		// need to do this a better way really
		if(geometry.faces.length == 12) {
			// assume box
	    	shape = new Ammo.btBoxShape(new Ammo.btVector3(original.scale.x * 0.5, original.scale.y * 0.5, original.scale.z * 0.5));
	    }
	    else {
	    	// assume cylinder
	    	shape = new Ammo.btCylinderShape(new Ammo.btVector3(original.scale.x * 0.5, original.scale.y * 0.5, original.scale.z * 0.5));
	    }
	    var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

	    mesh.visible = false;

	    var body = new Ammo.btGhostObject();
	    body.setCollisionShape(shape);
	    body.setWorldTransform(transform);
	    body.setCollisionFlags(4); // no collision response

	    this.dynamicsWorld.addCollisionObject(body, this.groupSwitch, this.maskSwitch);
	    body.activate();

	    this.switchToBodyPtrLookup[body.ptr] = switchIndex;
	    var switchVector = new THREE.Vector3(0, 0, 1);
		switchVector = switchVector.applyQuaternion(rot);
		this.switchOrientationVectors[switchIndex] = new Ammo.btVector3(
															switchVector.x,
															switchVector.y,
															switchVector.z);

	    return body;
	},

	addForce: function(original, forceIndex) {
		original.visible = false;

		original.updateMatrixWorld();
		var forceValue = 50.0; // todo - need to specify a force here
		if(forceIndex == 0) {
			forceValue = 400.0;
		}

		var forceQuat = original.quaternion;
		var forceVector = new THREE.Vector3(1,0,0);
		forceVector = forceVector.applyQuaternion(forceQuat);
		forceVector = forceVector.multiplyScalar(forceValue);

		//console.log(Pin.Utils.dpos(original.position) + " - " + Pin.Utils.dpos(forceVector));

		var forceData = {
			position: original.position,
			forceVector: new Ammo.btVector3(forceVector.x, forceVector.y, forceVector.z),
			force: forceValue
		};

		return forceData;
	},

	addLight: function(original, lightIndex) {
		var self = this;
		_.each(original.children, function(child) {
			if(child.material.specularMap) {
				var uniforms = {
					overlayTexture:  	{ type: "t",  value: child.material.map },
					backgroundTexture:  { type: "t",  value: child.material.specularMap },
					backgroundTint: 	{ type: "v4", value: new THREE.Vector4(1,1,1,1) }
				};

				var material = new THREE.ShaderMaterial({
					uniforms        : uniforms,
					vertexShader    : self.lightVertexShader,
					fragmentShader  : self.lightFragmentShader
				});

				child.material = material;
				child.material.transparent = true;
				child.material.needsUpdate = true;
			}
		});

		return original;
	},

	addPhysicsCallback: function(object, body, transform, limitsData) {

		var translationLimit = [1,1,1];
		if(limitsData && limitsData.translation) {
			translationLimit = limitsData.translation;
		}

		var rotationLimit = [1,1,1];
		if(limitsData && limitsData.rotation) {
			rotationLimit = limitsData.rotation;
		}

		this.physicsMeshCallbacks.push(function() {
	        body.getMotionState().getWorldTransform(transform);

	        var origin = transform.getOrigin();
	        object.position.set(origin.x() * translationLimit[0], origin.y() * translationLimit[1], origin.z() * translationLimit[2]);

	        var rotation = transform.getRotation();
	        object.quaternion.set(rotation.x() * rotationLimit[0], rotation.y() * rotationLimit[1], rotation.z() * rotationLimit[2], rotation.w());
	    });
	},

	addDebugToScene: function() {
		var materialGreen = new THREE.LineBasicMaterial({
	        color: 0x00ff00
	    });

	    var materialPurple = new THREE.LineBasicMaterial({
	        color: 0xff00ff
	    });

		var self = this;
		_.each(this.forceData, function(force) {
			if(!force) {
				return;
			}
			var position = force.position;
			var forceVector = force.forceVector;

			var offsetVector = position.clone();
		    offsetVector.add(Pin.Utils.convertToVector3(forceVector));

		    var geometry = new THREE.Geometry();
		    geometry.vertices.push(position.clone());
		    geometry.vertices.push(offsetVector);
		    var line = new THREE.Line(geometry, materialGreen);
		    self.scene.add(line);
		});

		_.each(this.switchBodies, function(switchBody, switchIndex) {
			if(switchBody) {
				var switchVector = self.switchOrientationVectors[switchIndex];
				var switchPosition = Pin.Utils.convertToVector3(switchBody.getWorldTransform().getOrigin());

				var switchVectorBig = Pin.Utils.convertToVector3(switchVector).multiplyScalar(2);
				var switchPositionEnd = switchPosition.clone().add(switchVectorBig);

				var geometry = new THREE.Geometry();
			    geometry.vertices.push(switchPosition.clone());
			    geometry.vertices.push(switchPositionEnd);
			    var line = new THREE.Line(geometry, materialPurple);
			    self.scene.add(line);
			}
		});
	},

	handleInput: function(keyCode, state) {
		var self = this;
		_.each(this.inputMapping, function(inputData) {
			if(keyCode == inputData.keyCode) {
				self.switchState[inputData.switchIndex] = state;
			}
		});
	},

	initScene: function() {

		var container = getCanvasContainer();

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera( 60, container.width() / container.height(), 0.1, 1000.0 );
		this.camera.position.x = 10;
		this.camera.position.y = 76;
		this.camera.position.z = 16;
		this.camera.lookAt( new THREE.Vector3(this.camera.position.x, 0, 2) );

		// Add the COLLADA

		this.scene.add(this.dae);

		// Lights

		this.scene.add(new THREE.AmbientLight(0x444444));

		var directionalLight = new THREE.DirectionalLight(0x999999);
		directionalLight.position.x = 7.5;
		directionalLight.position.y = 5.9;
		directionalLight.position.z = 4.2;
		directionalLight.rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), 0.0);
		directionalLight.castShadow = this.shadowsEnabled;
		directionalLight.shadowDarkness = 0.6;
		directionalLight.shadowCameraNear = 0.1;
		directionalLight.shadowCameraFar = 15;
		directionalLight.shadowCameraLeft = -15;
		directionalLight.shadowCameraRight = 15;
		directionalLight.shadowCameraTop = 15;
		directionalLight.shadowCameraBottom = -15;
		directionalLight.shadowBias = 0.002;
		this.scene.add(directionalLight);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(container.width(), container.height());

		this.renderer.shadowMapBias = 0.0039;
		this.renderer.shadowMapWidth = 1024;
		this.renderer.shadowMapHeight = 1024;
		this.renderer.shadowMap.enabled = this.shadowsEnabled;
		this.renderer.shadowMap.cullFace = THREE.CullFaceBack;

		container.append(this.renderer.domElement);

		this.initPostprocessing();

		// debugging
		if(this.addDebugging) {
			this.addDebugToScene();
		}

		// events
		var self = this;
		window.addEventListener( 'keyup', function(evt) {
			if(evt.keyCode == 82) { // R
				self.resetBallPositions();
			}

			self.handleInput(evt.keyCode, 0);
		}, false );

		window.addEventListener( 'keydown', function(evt) {
			//console.log(evt.keyCode);
			self.handleInput(evt.keyCode, 1);
		});
	},

	initPostprocessing: function() {
		// Setup render pass
		var renderPass = new THREE.RenderPass(this.scene, this.camera);

		// Setup depth pass
		var depthShader = THREE.ShaderLib["depthRGBA"];
		var depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);

		this.depthMaterial = new THREE.ShaderMaterial({ fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader,
			uniforms: depthUniforms, blending: THREE.NoBlending });

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
		this.depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

		// Setup SSAO pass
		this.ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
		this.ssaoPass.renderToScreen = true;
		this.ssaoPass.uniforms[ "tDepth" ].value = this.depthRenderTarget;
		this.ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
		this.ssaoPass.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssaoPass.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssaoPass.uniforms[ 'onlyAO' ].value = false;
		this.ssaoPass.uniforms[ 'aoClamp' ].value = 0.4;
		this.ssaoPass.uniforms[ 'lumInfluence' ].value = 0.5;

		// Add pass to effect composer
		this.effectComposer = new THREE.EffectComposer(this.renderer);
		this.effectComposer.addPass(renderPass);
		this.effectComposer.addPass(this.ssaoPass);
	},

	onResize: function() {
		var container = getCanvasContainer();
		var width = container.width();
		var height = container.height();
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);

		// Resize renderTargets
		this.ssaoPass.uniforms['size'].value.set( width, height );

		var pixelRatio = this.renderer.getPixelRatio();
		var newWidth  = Math.floor( width / pixelRatio ) || 1;
		var newHeight = Math.floor( height / pixelRatio ) || 1;
		this.depthRenderTarget.setSize( newWidth, newHeight );
		this.effectComposer.setSize( newWidth, newHeight );
	},

	processFlipper: function(flipperBody, buttonDown, multiplier) {
		var upImpulse =		this.physCfg.get("flipperUpTorque");
		var downImpulse =	this.physCfg.get("flipperDownTorque");

		var targetVelocity;

		var transform = flipperBody.getWorldTransform();
		if(buttonDown) {
			targetVelocity = upImpulse;
		}
		else {
			targetVelocity = downImpulse;
		}

		if(targetVelocity) {
			flipperBody.applyTorque(new Ammo.btVector3(0, targetVelocity * multiplier, 0));
		}
	},

	activateForce: function(forceIndex, ballBody, applyFromCenterToBody) {
		var associatedForce = this.forceData[forceIndex];
		if(associatedForce) {
			if(applyFromCenterToBody) {
				// Want to apply it from the center of the force -> the ballBody.
				var ballBodyPosition = Pin.Utils.convertToVector3(ballBody.getWorldTransform().getOrigin());
				var newForceVector = ballBodyPosition.sub(associatedForce.position);
				newForceVector.normalize();
				newForceVector.multiplyScalar(associatedForce.force);

				ballBody.applyForce(new Ammo.btVector3(newForceVector.x, newForceVector.y, newForceVector.z),
									associatedForce.position);
			}
			else {
				// Want to apply the force vector directly
				ballBody.applyForce(associatedForce.forceVector,
									associatedForce.position);
			}
		}
	},

	activateForceOnBall: function(forceId) {
		if(this.forceData[forceId]) {
			var self = this;
			_.find(this.ballBodies, function(ballBody) {
				var ballPosition = ballBody.getWorldTransform().getOrigin();
				var forcePosition = self.forceData[forceId].position;

				var d = Pin.Utils.distanceSq(ballPosition, forcePosition);
				if(d < 0.1) {
					self.activateForce(forceId, ballBody);
				}
			});
		}
	},

	getSwitchFromBodyPtr: function(bodyPtr) {
		return this.switchToBodyPtrLookup[bodyPtr];
	},

	render: function() {
		if(this.ssaoEnabled) {
			// for post processing
			this.scene.overrideMaterial = this.depthMaterial;
			this.renderer.render(this.scene, this.camera, this.depthRenderTarget, true);
			// Render renderPass and SSAO shaderPass
			this.scene.overrideMaterial = null;
			this.effectComposer.render();
		}
		else {
			this.renderer.render(this.scene, this.camera);
		}
	}
});

