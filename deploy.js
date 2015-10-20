var glob = require("glob"),
	services = require("./services");

var error = function(msg) {
	console.error("donejs deploy (error) -- " + msg)
	process.exit(1);
};

module.exports = function(packageJSON, deployName){
	var deploy = packageJSON.donejs.deploy;
	if (!deploy.services) {
		error("donejs.deploy section of package.json requires a " +
			  "'services' property");
	}

	var selected = services.selected(packageJSON, deployName, deploy.services,
									 services.list(), error);

	if (!selected) {
		error("the service you specified is not available");
	}

	console.log("donejs - deploying to '" + selected.type + "'\n");

	var files = glob.sync((deploy.root || "dist") + "/**/*");
	return selected.service.deploy(packageJSON, deploy, selected.config,
								   files, error);
};
