var spawn = require("child_process").spawn,
	_ = require("lodash"),
	push = require("divshot-push"),
	inquire = require("inquirer"),
	q = require("q");

var DIVSHOT_USER_CONFIG = process.env.HOME + "/.divshot/config/user.json";
var DIVSHOT_EXE = process.env.PWD + "/node_modules/.bin/divshot";
module.exports = {
	properties: [

	],
	deploy: function(package, options, files, error) {
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
						if (code) { defer.reject(); }
						defer.resolve();
					});
				} else {
					defer.reject();
				}
			});
			return defer.promise;
		};

		var pushToDivshot = function(token) {

		};

		var token = null;
		try {
			token = process.env.DIVSHOT_TOKEN || require(DIVSHOT_USER_CONFIG).token;
			if (!token) { throw new Error("token not found"); }
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
