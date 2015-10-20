var spawn = require("child_process").spawn,
    fs = require("fs")
	_ = require("lodash"),
	firebase = require("firebase-tools"),
	q = require("q");

module.exports = {
	properties: [{
		name: "config",
		desc: "Firebase application configuration data",
        default: function() {
            return {};
        }
	}],
	deploy: function(package, deploy, options, files, error) {
        function authenticate() {
            var token = spawn("firebase", ["prefs:token"]),
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
            }
            _.assign(config, { token: token, cwd: config.public });
            return config;
        }

        function deployToFirebase(config) {
            var defer = q.defer();
            console.log("donejs - deploying to '" + config.firebase + "'. Please be patient.");
            firebase.deploy.hosting(config).then(function() {
                console.log("donejs - successfully deployed to '" + config.firebase + "'.");
                defer.resolve();
            }).catch(function(err) {
                defer.reject(err);
            });
            return defer.promise;
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
