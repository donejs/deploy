var path = require("path"),
	fsx = require("fs-extra"),
	glob = require("glob"),
	_ = require("lodash"),
	parsepath = require("path-parse"),
	self = this;

exports._filePatterns = function(config) {
	if (config.glob) {
        if (_.isArray(config.glob)) {
            return config.glob;
        }
        return [config.glob];
    }
    return [];
};

exports._copyFiles = function(from, to, error) {
	console.log("Copying:")

	var files = [];
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
			files.push(self._copyFile(file, to, error));
		});
	});
	return files;
};

exports._copyFile = function(from, to, error) {
	var parsed = parsepath(from),
		dir = parsed.dir,
		name = parsed.base
		dest = to + "/" + dir + "/" + name;
	try {
		fsx.mkdirsSync(dir);
		fsx.copySync(from, dest);
	} catch (e) {
		error(e.message);
	}
	console.log("  + " + from);
	return dest;
};

exports.package = function(config, error) {
	var directory = config["dest"] || "dist",
		files = self._filePatterns(config);
	files.push("node_modules/steal/steal.production.js");
	self._copyFiles(files, directory, error);

	return glob.sync(directory + "/**/*.*");
};
