donejs deploy
============
The **donejs deploy** command allows you to bundle up your static assets not
touched during the steal build process and deploy them and your JS bundles to a
third-party storage/hosting provider like Amazon's S3.

Deploying your assets can be as simple as typing one command: `donejs deploy [service]`.

### Configuration
Here is a sample configuration for deploying to Amazon's S3. All `deploy` configuration options exist in the `donejs.deploy` of `package.json`.

```json
"deploy": {
	"dest": "dist",
	"glob": "test/assets/**/*.png",
	"services": {
		"production": {
			"type": "s3",
			"default": true,
			"bucket": "donejs.deploy",
			"configPath": "./aws.s3.json"
    	}
	}
}
```

`deploy.dest` *{String}* - is the relative destination directory for your static assets not bundled by building with [StealJS Tools](http://stealjs.com/docs/steal-tools.html).  This should be the same value as `bundlesPath` in your `stealTools.build` function.

`deploy.glob` *{String | Object | Array}* - the glob pattern used to find files to move to `deploy.bundlesPath`. When using objects as the value refer to the [globObject](http://documentjs.com/docs/documentjs.find.globObject.html) documentation.

`deploy.services` *{Object}* - An object where each property is the name of a service that can be used as an argument to `donejs deploy <service>`.

The properties in each `service` object are specific to each service with the expection of `type` and `default`.
