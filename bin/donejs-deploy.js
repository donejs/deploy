#!/usr/bin/env node

// Usage:
//   donejs-deploy build_directory service [options]
//	 donejs-deploy --dir dist/bundles --service heroku --api-key HFKSF7382
var bundle = require("../lib/package");

// command line argument checking
bundle(process.argv[1]);
