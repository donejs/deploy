var assert = require("assert");
var deploy = require("../deploy");
var firebase = require("firebase-tools");
var Promise = require("q").Promise;

describe("firebase", function(){
	beforeEach(function(){
		this.firebaseHosting = firebase.deploy.hosting;
	});

	afterEach(function(){
		firebase.deploy.hosting = this.firebaseHosting;
	});

	it("using an env variable works", function(done){
		var pkg = {};
		var deployConfig = {
			root: __dirname + "/tests/dist",
			services: {
				developement: {
					type: "firebase",
					config: {
						"firebase": "fake-test",
						"public": __dirname + "/tests/dist",
						"ignore": [
                            "firebase.json",
                            "**/.*",
                            "**/node_modules/**"
                        ]
					}
				}
			}
		};

		firebase.deploy.hosting = function(config){
			return new Promise(function(resolve, reject){
				assert(config.cwd, "Provided a cwd");
				assert(config.token, "Provided a token");
				assert(config.public, "Provided a public folder");

				resolve();
			});
		};

		pkg.donejs = { deploy: deployConfig };
		process.env.FIREBASE_TOKEN = "-K14RVPW-tJxMerR3nWa67244180046f";

		deploy(pkg).then(function(){
			assert(true, "request finished successfully");
			done();
		}, function(err){
			console.error(err);
			assert(false, "an error");
			done();
		});
	});
});
