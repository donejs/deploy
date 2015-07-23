module.exports = function(directory) {
	try {
		var stats = fs.lstatSync(directory);
		if (!stats.isDirectory()) {
			throw new Error("'" + directory + "' is not a directory.");
		}
	} catch (e) {
		throw new Error("'" + directory + "' directory must exist prior to running this command.");
	}
	console.log("Deploying from destination directory: " + directory);
};
