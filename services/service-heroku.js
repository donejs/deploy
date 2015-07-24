module.exports = {
	name: "Heroku",
	args: [
		{ name: "heroku-token", alias: "heroku-t", type: String, description: "Your Heroku API token" }
	],
	deploy: function(options) {
		console.log("WE FOUND HEROKU!!!");
	}
};
