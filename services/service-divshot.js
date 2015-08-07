var spawn = require("child_process").spawn,
	_ = require("lodash"),
	push = require("divshot-push"),
	inquire = require("inquirer"),
	q = require("q");

var DIVSHOT_USER_CONFIG = process.env.HOME + "/.divshot/config/user.json";
var DIVSHOT_EXE = require.resolve("divshot-cli");
module.exports = {
	properties: [{
		name: "config",
		desc: "Divshot application configuration data"
	},{
		name: "environment",
		desc: "Environment to push to (production, staging, development). Defaults to 'development'.",
		default: "development"
	}],
	deploy: function(package, deploy, options, files, error) {
		var promptUserLogin = function() {
			console.log("\ndonejs was unable to find your Divshot user configuration. So...");

			var defer = q.defer();
			inquire.prompt([
				{
					type: "confirm",
					message: "Login into Divshot? ",
					name: "login"
				}
			], function(answers) {
				if (answers.login) {
					spawn(DIVSHOT_EXE, ["login"]).on("close", function(code) {
						if (code) {
							return defer.reject();
						}
						defer.resolve();
					});
				} else {
					defer.reject();
				}
			});
			return defer.promise;
		};

		var pushToDivshot = function(token) {
			var environment = options.service.environment;
			if (!environment) {
				if (_.includes(["development", "staging", "production"], options.name[0])) {
					environment = options.name[0];
				} else {
					console.log("An environment was not configured and the config name was not a valid environement.");
					console.log("Defaulting to deploy to 'development'\n");

					environment = "development";
				}
			}
			var status = push({
				root: deploy.root,
				environment: environment,
				config: options.service.config,
				token: token
			});

			status.onEnd(function(data) {
				console.log("\nApplication deployed to: '" + data.environment + "'.");
				console.log("You can view your app at the following URL: '" + data.url + "'");
			});

			status.onApp("create", function(name) {
				process.stdout.write("App doesn't exist. Creating app: '" + name + "' ... ");
			}).onApp("end", function() {
				process.stdout.write("DONE.\n");
			});

			status.onFinalize("start", function() {
				process.stdout.write("Finalizing build ... ");
			}).onFinalize("end", function() {
				process.stdout.write("DONE.\n");
			});

			status.onRelease("start", function(env) {
				process.stdout.write("Releasing build to '" + env + "' ... ");
			}).onRelease("end", function() {
				process.stdout.write("DONE.\n");
			});

			status.onUpload("start", function(count) {
				console.log("Uploading " + count + " files.");
			}).onUpload("retry", function(err) {
				console.log(err);
				console.log("Retrying ... ");
			});
		};

		var token = null;
		try {
			token = process.env.DIVSHOT_TOKEN || require(DIVSHOT_USER_CONFIG).token;
			if (!token) { throw new Error("token not found"); }

			pushToDivshot(token);
		} catch (e) {
			promptUserLogin().then(function(result) {
				token = require(DIVSHOT_USER_CONFIG).token;

				pushToDivshot(token);
			}, function(err) {
				console.log("\nCompletely understandable, but we are going to need that API token.")
				console.log("You could always get it yourself. Just do the following:");
				console.log("   1. npm install divshot-cli -g");
				console.log("   2. divshot login");
			});
		}
	}
};
