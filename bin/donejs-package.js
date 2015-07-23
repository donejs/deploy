#!/usr/bin/env node

var args = require("command-line-args"),
	package = require("../lib/package");

var cli = args([
	{ name: "help", alias: "h", type: Boolean, description: "Print usage instructions" },
	{ name: "dir",  alias: "d", type: String,  description: "The build directory", defaultOption: true }
]);
var usage = cli.getUsage({
	header: "donejs-package - Packages up assets not included during the build process.",
	footer: "\n  For more information, visit http://donejs.com"
});

var options = {};
try {
	options = cli.parse();
} catch (e) {
	console.error(e.message);
	process.exit(1);
}

if (options.help) { console.log(usage); process.exit(0); }
if (!Object.keys(options).length || !options.dir) {
	console.error("donejs-package requires a destination directory to be specified.")
	process.exit(1);
}

package(options.dir);
process.exit(0);
