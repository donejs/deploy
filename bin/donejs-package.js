#!/usr/bin/env node

// Usage:
//   donejs-package build_directory
//   donejs-package --dir dist/bundles
var fs = require("fs"),
	package = require("../package");

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

// here we will call the package command exported from lib/package.js
package(destintion);
