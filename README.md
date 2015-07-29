donejs deploy
============
The __donejs deploy__ command allows you to bundle up your static assets not
touched during the steal build process and deploy them and your JS bundles to a
third-party storage/hosting provider like Amazon's S3.

Deploying your assets can be as simple as typing one command: `donejs deploy [service]`.

### Configuration
Here is a sample configuration for deploying to Amazon's S3. All `deploy` configuration options exist in the `donejs.deploy` of `package.json`.

```json
"deploy": {
	"bundles-path": "dist/bundles",
	"glob": "test/assets/**/*.png",
	"services": {
		"production": {
			"type": "s3",
			"bucket": "donejs.deploy",
			"config-path": "./aws.s3.json",
			"default": true
    	}
	}
}
```
