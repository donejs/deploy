# donejs deploy

[![Greenkeeper badge](https://badges.greenkeeper.io/donejs/deploy.svg)](https://greenkeeper.io/)

* [Configuration](#configuration)
	* [S3 Configuration Options](#s3-configuration-options)
	* [Firebase Configuration Options](#firebase-configuration-options)
* [Writing a New Service](#writing-a-new-service)

The `donejs deploy` command allows you to bundle up your static assets not touched during the steal build process and deploy them and your JS bundles to a third-party storage/hosting provider like Amazon's S3.

Deploying your assets can be as simple as typing one command: `donejs deploy [service]`.

## Configuration
Here is a sample configuration for deploying to Amazon's S3. All `deploy` configuration options exist in the `donejs.deploy` of `package.json`.

```json
"deploy": {
	"root": "dist",
	"services": {
	}
}
```

>`deploy.root` *{String="./dist"}*

The relative destination directory for your static assets not bundled by building with [StealJS Tools](http://stealjs.com/docs/steal-tools.html).  This should be the same value as `dest` in your `stealTools.build` function.

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

### S3 Configuration Options
> `services.<service name>.bucket` *{String}*

The name of the S3 bucket. If one is not created on S3, a bucket will be created with the name provided. If this property is not provided the value
of the `name` property in `package.json` is used as default.

> `services.<service name>.credentials` *{String}*

The relative path to a file containing the two authentication properties: accessKeyId and secretAccessKey.  For example, `./aws.s3.json` would contain something like:

```json
{
	"accessKeyId": "KFJSKJD9234DSFI",
	"secretAccessKey": "6f5902ac237024bdd0c176cb93063dc4"
}
```
If this property is not provided the default behavior is to read `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` from the nodejs environment.

Read [Configuring the SDK in Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) for more information about this topic.

### Firebase Configuration Options
> `services.<service name>.config` *{Object}*

The Firebase [configuration object](https://www.firebase.com/docs/hosting/guide/full-config.html) specific to your deployment.

## Writing a New Service
Create a file in the `services` directory where the name of the file matches the following convention: `service-*.js`. The `*` will be used as the value for the `package.donejs.deploy.<service name>.type` property. This file should export two properties: `properties` and `deploy`.

> `properties` *{Array [Object]}*

The `properties` array contains objects with `name` and `desc` properties.

> `properties[].name` *{String}*

The name of a configuration property required by this service type.

> `properties[].desc` *{String}*

The description of the named property.  This is output to the console when the usage is displayed.

> `properties[].default` *{Function| String | Number | Boolean | Array}*

This value is used by the service if the property does not exist in the selected service object.
If the value of `default` is a function, the property will validate as long as the function returns
a truthy value. In the function, `this.env` can be used to access the process environment, and
`this.pkg` can be used to access the package.json object. The default value or value returned by the
function will be placed on the service object so that it can be accessed with the property name expected.

> `deploy` *{Function(package, deploy, options, files, err)}*

The deploy function is where the service's magic happens.

> `package` *{Object}*

The package.json object. Provided in case there are contextual project values you wish to use.

> `deploy` *{Object}*

The deploy  property object of package.json.

> `options` *{Object}*

This is the configuration object of the selected service. It has two properties, `name` which is the configuration name, and `service` which is the service configuration specific to your deployment.

> `files` *{Array [String]}*

The files moved to the directory configured by the `dest` property.

> `error` *{Function(message)}*

Call this function when an error has occurred and provide the string that should be shown to the user.
