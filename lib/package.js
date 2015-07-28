var fsx = require("fs-extra"),
	packpath = require("packpath")
	self = this;

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

exports._filePatterns = function(config) {
	if (config.glob && typeof config.glob === "string") {
		return [config.glob];
	}
	return config.glob;
}

exports._copyFiles = function(from, to) {
	console.log(from, to);
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

exports._fromConfig = function(filename) {
	var config = fsx.readJsonSync(packpath.self() + "/" + filename);
	return config.donejs.deploy;
};

exports.package = function(filename) {
	var donejsDeploy = self._fromConfig(filename),
		directory = donejsDeploy["bundles-path"] || "dist/bundles";
		globs = self._filePatterns(donejsDeploy);

	if (!globs.length) {
		throw new Error("a file list must be provided on the "
			+ "command line or in package.json");
	}
	files = globs;

	files.push("node_modules/steal/steal.production.js");
	self._copyFiles(files, directory);
};
