var fsx = require("fs-extra");

exports._destinationExists = function(dest) {
	var fs = require("fs");
	try {
		var stats = fs.lstatSync(dest);
		if (!stats.isDirectory()) {
			throw new Error("'" + dest + "' is not a directory.");
		}
	} catch (e) {
		throw new Error("'"
			+ dest
			+ "' directory must exist prior to running this command.");
	}
};

exports._fromPackageJSON = function(packagePath) {
	var packageJSON = fsx.readJsonSync(packagePath + "/package.json");
	return packageJSON.files || [];
};

exports._copyFiles = function(from, to) {
	var glob = require("glob"),
		self = this;

	console.log("Copy:")
	from.forEach(function(pattern) {
		var matches = glob.sync(pattern);
		matches.forEach(function(file) {
			self._copyFile(file, to);
		});
	});
};

exports._copyFile = function(from, to) {
	var path = require("path"),
		parsed = path.parse(from),
		dir = parsed.dir,
		name = parsed.base
		dest = to + "/" + dir + "/" + name;

	fsx.mkdirsSync(dir);
	try {
		fsx.copySync(from, dest);
	} catch (e) {
		throw new Error(e.message);
	}
	console.log("  " + from + " -> " + dest);
};

exports.package = function(files, directory) {
	var exec = require("child_process").execSync

	this._destinationExists(directory);
	if (!files) {
		var packageFiles =
			this._fromPackageJSON(exec("npm prefix").toString("utf8").trim());
		if (!packageFiles.length) {
			throw new Error("a file list must be provided on the "
				+ "command line or in package.json");
		}
		files = packageFiles;
	}
	files.push("node_modules/steal/steal.production.js");
	this._copyFiles(files, directory);
};
