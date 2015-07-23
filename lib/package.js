var exec = require("child_process").execSync,
	fs = require("fs"),
	fsx = require("fs-extra");

module.exports = function(directory) {
	try {
		var stats = fs.lstatSync(directory);
		if (!stats.isDirectory()) {
			throw new Error("'" + directory + "' is not a directory.");
		}
	} catch (e) {
		throw new Error("'" + directory + "' directory must exist prior to running this command.");
	}

	var packagePath = exec("npm prefix").toString("utf8").trim();
	var packageJSON = JSON.parse(fs.readFileSync(packagePath + "/package.json", {
		encoding: "utf8"
	}));

	if (!packageJSON.files) {
		throw new Error("a list of files to copy must be specified on the 'files' property in package.json");
	} else {
		packageJSON.files.push("node_modules/steal/steal.production.js");
		console.log("Copy:")
		packageJSON.files.forEach(function(path) {
			try {
				fsx.copySync(path, directory);
			} catch (e) {
				throw new Error(e.message);
			}
			console.log("  " + path + " -> " + directory);
		});
	}
};
