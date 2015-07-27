module.exports = {
	// where glob is a string
	"string": {
		"donejs": {
			"deploy": {
				"bundles-path": "dist/bundles",
				"glob": "assets/**/*.png",
				"services": {
					"production": {
						"type": "s3",
						"bucket": "donejs.deploy"
						"config-path": "path/to/config/file",
						"default": true
					}
				}
			}
		}
	},

	// where glob is an object
	"object": {

	}

	// where glob is an array of strings and objects
	"array": {

	}
}
