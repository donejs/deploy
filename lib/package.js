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

exports._fromPackageJSON = function(packagePath, filename) {
	var packageJSON =
		fsx.readJsonSync(packagePath + "/" + filename);
	if (packageJSON.donejs && packageJSON.donejs.glob) {
		if (typeof packageJSON.donejs.glob === "string") {
			return [packageJSON.donejs.glob];
		}
	} else {
		return [];
	}
};

exports._copyFiles = function(from, to) {
	var glob = require("glob"),
		self = this;

	console.log("Copying:")

	globs = [];
	from.forEach(function(pattern) {
		var matches = [];
		if (typeof pattern === "string") {
			matches = glob.sync(pattern);
		} else if (typeof pattern === "object" && pattern.pattern) {
			if (!pattern.pattern) {
				throw new Error("glob object must specify a pattern property");
			}
			delete pattern.pattern;
			matches = glob.sync(pattern.pattern, pattern);
		}
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
	var packagePath = require("packpath");

	this._destinationExists(directory);
	if (!files) {
		var packageGlobs =
			this._fromPackageJSON(packagePath.self(), "package.json");
		if (!packageGlobs.length) {
			throw new Error("a file list must be provided on the "
				+ "command line or in package.json");
		}
		files = packageGlobs;
	}
	files.push("node_modules/steal/steal.production.js");
	this._copyFiles(files, directory);
};
