var assert = require("assert");

describe("donejs-package: command line argument validation",
function() {
	var exec = require("child_process").exec,
		callback = function(done, code) {
			return function(error, stdout, stderr) {
				if (error) {
					assert(error.code, code, "correctly exited with a code of 1");
				}
				done();
			}
		};

	it("should exit with an error when the argv.length is less than 3",
	function(done) {
		var cmd = exec("node ../bin/donejs-package", {
				cwd: __dirname
			},
			callback(done, 1));
	});

	it("should exit when the destination directory doesn't exist",
	function(done) {
		var cmd = exec("node ../bin/donejs-deploy dist/bundles", {
				cwd: __dirname
			},
			callback(done, 1));
	});

	it("should be able to use -d to specify a destination directory",
	function(done) {
		var cmd = exec("node ../bin/donejs-deploy -d dist/bundles", {
				cwd: __dirname
			},
			callback(done, 1));
	});

	it("should be able to use --dir to specify a destination directory",
	function(done) {
		var cmd = exec("node ../bin/donejs-deploy --dir dist/bundles", {
				cwd: __dirname
			},
			callback(done, 1));
	});
});