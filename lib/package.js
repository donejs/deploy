var fsx = require("fs-extra"),
	_ = require("lodash"),
	packpath = require("packpath")
	self = this;

exports._filePatterns = function(config) {
	if (config.glob && _.isArray(config.glob)) {
		return config.glob;
	}
	return [config.glob];
}

exports._copyFiles = function(from, to) {
	var glob = require("glob"),
		self = this;

	console.log("Copying:")

	globs = [];
	from.forEach(function(pattern) {
		var matches = [];
		if (_.isString(pattern)) {
			matches = glob.sync(pattern);
		} else if (_.isObject(pattern) && pattern.pattern) {
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

exports.package = function(config) {
	var directory = config["bundles-path"] || "dist/bundles",
		globs = self._filePatterns(config);

	if (!globs.length) {
		throw new Error("a file list must be provided on the "
			+ "command line or in package.json");
	}
	files = globs;

	files.push("node_modules/steal/steal.production.js");
	self._copyFiles(files, directory);
};
