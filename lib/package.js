module.exports = function(directory) {
	try {
		var stats = fs.lstatSync(directory);
		if (!stats.isDirectory()) {
			console.error("'" + directory + "' is not a directory.");
			process.exit(1);
		}
	} catch (e) {
		console.error("'" + directory + "' directory must exist prior to running this command.");
		process.exit(1);
	}
	console.log("Deploying from destination directory: " + directory);
};
