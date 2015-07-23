var assert = require("assert");

describe("command line argument validation", function() {
	it("exit with an error when the argv.length is less than 3", function(done) {
		var exec = require("child_process").exec,
			cmd = exec("node ../bin/donejs-deploy", {
				cwd: __dirname
			},
			function(error, stdout, stderr) {
				if (error) {
					assert(error.code, 1, "correctly exited with a code of 1");
				}
				done();
			});
	})
});
