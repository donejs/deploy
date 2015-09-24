var fs = require("fs"),
	path = require("path"),
	_ = require("lodash"),
	mimeType = require("mime"),
	q = require("q");
	AWS = require("aws-sdk");

module.exports = {
	properties: [{
		name: "bucket",
		desc: "The name of your S3 bucket. It will be created if it doesn't exist.",
		default: function() {
			if (this.pkg.name) { return this.pkg.name; }
			return false;
		}
	}, {
		name: "credentials",
		desc: "The relative path to the file containing the object: {accessKeyId, secretAccessKey}.",
		default: function() {
			if (this.env.S3_ACCESS_KEY_ID && this.env.S3_SECRET_ACCESS_KEY) {
				return {
					"accessKeyId": process.env.S3_ACCESS_KEY_ID,
					"secretAccessKey": process.env.S3_SECRET_ACCESS_KEY
				};
			}
			return false;
		}
	}],

	deploy: function(package, deploy, options, files, error) {
		var bucketExists = function(bucketName) {
			console.log("Checking for S3 Bucket: '" + bucketName + "'");

			var deferred = q.defer();
			S3.headBucket({
				Bucket: bucketName
			}, function(err, resp) {
				if (err) return deferred.reject(err);
				deferred.resolve(true);
			});
			return deferred.promise;
		};

		var createBucket = function(bucketName) {
			console.log("Bucket not found. Creating S3 Bucket: '"
				+ bucketName + "'");

			var deferred = q.defer();
			S3.createBucket({
				Bucket: bucketName
			}, function(err, resp) {
				if (err) return deferred.reject(err);
				deferred.resolve(bucketName);
			});
			return deferred.promise;
		};

		var uploadFile = function(path, bucket) {
			var isDir = fs.lstatSync(path).isDirectory();
			if(isDir) return;

			S3.putObject({
				ACL: "public-read",
				Bucket: bucket,
				Key: path,
				Body: fs.readFileSync(path),
				ContentType: mimeType.lookup(path)
			}, function(err, data) {
				if (err) { error(err); }
				console.log("  + " + path);
			});
		};

		var uploadFiles = function(files, bucket) {
			console.log("Uploading:");
			files.forEach(function(file) {
				uploadFile(file, bucket);
			});
		};

		try {
			var creds = options.credentials || options.service.credentials;
			if (_.isString(creds)) {
				AWS.config.loadFromPath(path.resolve(creds));
			} else {
				AWS.config.update({
					accessKeyId: creds.accessKeyId,
					secretAccessKey: creds.secretAccessKey
				});
			}
		} catch (e) {
			error(e.message);
		}

		var S3 = new AWS.S3();

		var bucket = options.service.bucket;
		return bucketExists(bucket).then(function(value){
			uploadFiles(files, bucket);
		}, function(err) {
			return createBucket(bucket).then(function(value) {
				return uploadFiles(files, bucket)
			}, function(err) {
				error(err);
			});
		});
	}
}
