var fsx = require("fs-extra"),
	path = require("path"),
	glob = require("glob");

module.exports = (function() {
	var pattern = __dirname + "/../services/**/service-*.js";
	return glob.sync(pattern).map(function(servicePath) {
		return {
			name: path.parse(servicePath).name.split("-")[1],
			service: require(servicePath)
		}
	});
})();
