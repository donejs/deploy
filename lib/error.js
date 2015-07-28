module.exports = function(msg) {
	console.error("donejs deploy (error) -- " + msg)
	process.exit(1);
};
