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
            console.log("donejs - deploying to '" + config.firebase + "'. Please be patient.");
            firebase.deploy.hosting(config).then(function() {
                console.log("donejs - successfully deployed to '" + config.firebase + "'.");
                process.exit(0);
            }).catch(function(err) {
                error(err);
                process.exit(1);
            });
        }

        var defer = q.defer();
        if (process.env.FIREBASE_TOKEN) {
            defer.resolve(process.env.FIREBASE_TOKEN);
        } else {
            authenticate().then(function(token) {
                defer.resolve(token);
            });
        }
        defer.promise.then(function(token) {
            try {
                deployToFirebase(createConfig(token));
            } catch (e) {
                error(e);
            }
        });
	}
};
