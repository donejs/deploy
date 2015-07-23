#!/usr/bin/env node
// donejs-package <directory>

var fs = require("fs");

// expected to be run like so:
//   ./node_modules/.bin/donejs-package dist/bundles
// given the above command, process.argv will look like so:
//	 [ '/Users/mark/.nvm/versions/io.js/v2.4.0/bin/iojs',
//     '/Users/mark/.nvm/versions/io.js/v2.4.0/bin/donejs-deploy',
//     'dist/bundles' ]
// therefore we need to make sure that process.argv.length has a length
// of at least 3
if (process.argv.length < 3) {
	process.stderr.write("'donejs-package' requires the destination directory to be passed as an argument.");
	process.exit(1);
}

var destination = process.argv[2];
try {
	var stats = fs.lstatSync(destination);
	if (!stats.isDirectory()) {
		process.stdout.write("'" + destination + "' is not a directory.");
		process.exit(1);
	}
} catch (e) {
	process.stderr.write("Unable to get information about the destination directory.");
	process.exit(1);
}

// copy the files listed in the package.json "files" property
// to a directory given as a command line argument
