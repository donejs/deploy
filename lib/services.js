var fsx = require("fs-extra"),
	glob = require("glob");

module.exports = (function() {
	var matches = glob.sync(__dirname + "/../services/**/service-*.js");
	return matches.map(function(servicePath) {
		var service = require(servicePath);
		service.args.map(function(arg) {
			arg.description = "(" + service.name + ")" + " " + arg.description;
		});
		return {name: service.name.toLowerCase(), service: service};
	});
})();
