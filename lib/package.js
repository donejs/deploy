module.exports = function(directory) {
	try {
		var stats = fs.lstatSync(directory);
		if (!stats.isDirectory()) {
			process.stdout.write("'" + directory + "' is not a directory.");
			process.exit(1);
		}
	} catch (e) {
		process.stderr.write("'" + directory + "' directory must exist prior to running this command.");
		process.exit(1);
	}
	console.log("Deploying from destination directory: " + directory);
};
