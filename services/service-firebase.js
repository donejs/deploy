var spawn = require("cross-spawn-async"),
    fs = require("fs")
	_ = require("lodash"),
	firebase = require("firebase-tools"),
	q = require("q"),
	selfDestruct = require("self-destruct");

var FIREBASE_EXE = require.resolve("firebase-tools/bin/firebase");

module.exports = {
	properties: [{
		name: "config",
		desc: "Firebase application configuration data",
        default: function() {
            return {};
        }
	}],
	deploy: function(package, deploy, options, files, error) {
		hasOwnFirebaseJSON = false;

        function authenticate() {
            var token = spawn("node", [FIREBASE_EXE, "prefs:token"]),
                defer = q.defer();
            token.stdout.on("data", function(data) {
                defer.resolve(data.toString());
            });
            token.on("close", function(code) {
                if (code) {
                    firebase.login({}).then(function(config) {
                        defer.resolve(config.session.token);
                    });
                }
            });
            return defer.promise;
        }

        function createConfig(token) {
            var config = options.config || options.service.config;
            if (_.isEmpty(config)) {
                config = require(process.cwd() + "/firebase.json");
				hasOwnFirebaseJSON = true;
            }
            _.assign(config, { token: token, cwd: config.public });
            return config;
        }

        function deployToFirebase(config) {
            console.log("donejs - deploying to '" + config.firebase + "'. Please be patient.");
			config.ignore = config.ignore || [];

			var doDeploy = function(){
				return firebase.deploy.hosting(config).then(function() {
					console.log("donejs - successfully deployed to '" + config.firebase + "'.");
				});
			};

			var deployPromise;

			if(hasOwnFirebaseJSON) {
				deployPromise = doDeploy();
			} else {
				var firebaseJsonPath = process.cwd() + "/firebase.json";
				var content = JSON.stringify(config);
				 deployPromise = selfDestruct(firebaseJsonPath, content, "utf8")
					.then(function(destroy){
						var deployPromise = doDeploy();
						deployPromise.then(destroy, destroy);
						return deployPromise;
					});
			}

			return deployPromise.then(null, function(err){
				if(/Invalid Firebase/.test(err.message)) {
					console.error("The app", config.firebase, "does not exist.",
								  "Please go to https://www.firebase.com/account/ and create it, then rerun the deploy");
				}
				throw err;
			});
        }

        var adf = q.defer();
        if (process.env.FIREBASE_TOKEN) {
            adf.resolve(process.env.FIREBASE_TOKEN);
        } else {
            authenticate().then(function(token) {
                adf.resolve(token);
            });
        }

        var ddf = q.defer();
        adf.promise.then(function(token) {
            deployToFirebase(createConfig(token)).then(function() {
                ddf.resolve();
            }, function(err) {
                ddf.reject(err);
            });
        });
        return ddf.promise;
	}
};
