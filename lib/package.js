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

exports._copyFiles = function(from, to, error) {
	var glob = require("glob"),
		self = this;

	console.log("Copying:")

	globs = [];
	from.forEach(function(pattern) {
		var matches = function(pattern) {
			if (_.isString(pattern)) { return glob.sync(pattern); }
			if (_.isObject(pattern) && pattern.pattern) {
				if (!pattern.pattern) {
					error("glob object must specify a pattern property");
				}
				delete pattern.pattern;
				return glob.sync(pattern.pattern, pattern);
			}
		}(pattern);
		matches.forEach(function(file) {
			self._copyFile(file, to, error);
		});
	});
};

exports._copyFile = function(from, to, error) {
	var path = require("path"),
		parsed = path.parse(from),
		dir = parsed.dir,
		name = parsed.base
		dest = to + "/" + dir + "/" + name;
	try {
		fsx.mkdirsSync(dir);
		fsx.copySync(from, dest);
	} catch (e) {
		error(e.message);
	}
	console.log("  " + from + " -> " + dest);
};

exports.package = function(config, error) {
	var directory = config["bundles-path"] || "dist/bundles",
		globs = self._filePatterns(config);

	if (!globs.length) {
		error("a file list must be provided on the command line or in package.json");
	}
	files = globs;

	files.push("node_modules/steal/steal.production.js");
	self._copyFiles(files, directory, error);
};
