var exec = require("child_process").execSync,
	fs = require("fs"),
	fsx = require("fs-extra");

var copyFiles = function(directory, files) {
	console.log("Copy:")
	files.forEach(function(path) {
		try {
			fsx.copySync(path, directory);
		} catch (e) {
			throw new Error(e.message);
		}
		console.log("  " + path + " -> " + directory);
	});
}

module.exports = function(directory, files) {
	try {
		var stats = fs.lstatSync(directory);
		if (!stats.isDirectory()) {
			throw new Error("'" + directory + "' is not a directory.");
		}
	} catch (e) {
		throw new Error("'" + directory + "' directory must exist prior to running this command.");
	}

	if (!files) {
		var packagePath = exec("npm prefix").toString("utf8").trim();
		var packageJSON = JSON.parse(fs.readFileSync(packagePath + "/package.json", {
			encoding: "utf8"
		}));

		if (!packageJSON.files) {
			throw new Error("files to copy must be provided on the command line or in package.json");
		}
		files = packageJSON.files;
	}
	files.push("node_modules/steal/steal.production.js");
	copyFiles(directory, files);
};
