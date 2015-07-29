# donejs deploy

* [Configuration](#configuration)
	* [S3 Configuration Options](#s3-configuration-options)
* [Writing a New Service](#writing-a-new-service)

The `donejs deploy` command allows you to bundle up your static assets not touched during the steal build process and deploy them and your JS bundles to a third-party storage/hosting provider like Amazon's S3.

Deploying your assets can be as simple as typing one command: `donejs deploy [service]`.

## Configuration
Here is a sample configuration for deploying to Amazon's S3. All `deploy` configuration options exist in the `donejs.deploy` of `package.json`.

```json
"deploy": {
	"dest": "dist",
	"glob": "test/assets/**/*.png",
	"services": {
	}
}
```

>`deploy.dest` *{String="dist/bundles"}*

The relative destination directory for your static assets not bundled by building with [StealJS Tools](http://stealjs.com/docs/steal-tools.html).  This should be the same value as `dest` in your `stealTools.build` function.

>`deploy.glob` *{String | Object | Array [Object|String]}*

The glob pattern used to find files to move to `deploy.bundlesPath`. When using objects as the value refer to the [globObject](http://documentjs.com/docs/documentjs.find.globObject.html) documentation.

>`deploy.services` *{Object}*

An object where each property is the name of a service that can be used as an argument to `donejs deploy <service>`.

The properties in each `service` object are specific to each service with the exception of `type` and `default`.

```json
"services": {
	"production": {
		"type": "s3",
		"default": true,
		"bucket": "donejs.deploy",
		"configPath": "./aws.s3.json"
	}
}
```
> `services.<service name>.type` *{String}*

The service that you want to deploy to. There is currently only one option for this property: **s3**. This is used to select which service module to load from the services directory.

> `services.<service name>.default` *{Boolean}*

A service that is marked as default is loaded when no argument is provided to the `donejs deploy` command. If there are multiple objects with `default` properties that are true, the first one is loaded.

Here is how a service is selected:
1. If a service is provided as a command line argument, look it up as a property on the `services` object.
	1. If the property exists, use that property's value.
	2. If the property does not exist, assume that no argument was provided on the command line.
2. If no service argument is provided on the command line.
	1. Gather all services where the property `default` is `true`.
		1. If there is only one object, use that object.
		2. If there is more than one object, use the first object.
		3. If there are no objects with a `default` property with a value of `true`.
			1. Use the first service object in `package.deploy.services`.

### S3 Configuration Options
> `services.<service name>.bucket` *{String}*

The name of the S3 bucket. If one is not created on S3, a bucket will be created with the name provided.

> `services.<service name>.configPath` *{String}*

The relative path to a file containing the two authentication properties: accessKeyId and secretAccessKey.  For example, `./aws.s3.json` would contain something like:

```json
{
	"accessKeyId": "KFJSKJD9234DSFI",
	"secretAccessKey": "6f5902ac237024bdd0c176cb93063dc4"
}
```

Read [Configuring the SDK in Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) for more information about this topic.

## Writing a New Service
Create a file in the `services` directory where the name of the file matches the following convention: `service-*.js`. The `*` will be used as the value for the `package.donejs.deploy.<service name>.type` property. This file should export two properties: `properties` and `deploy`.

> `properties` *{Array [Object]}*

The `properties` array contains objects with `name` and `desc` properties.

> `properties[].name` *{String}*

The name of a configuration property required by this service type.

> `properties[].desc` *{String}*

The description of the named property.  This is output to the console when the usage is displayed.

> `deploy` *{Function(options, files, err)}*

The deploy is where the service's magic happens.

> `options` *{Object}*

This is the configuration object of the selected service.

> `files` *{Array [String]}*

The files moved to the directory configured by the `dest` property.

> `error` *{Function(message)}*

Call this function when an error has occurred and provide the string that should be shown to the user.
