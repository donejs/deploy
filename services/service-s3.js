var fs = require("fs"),
	path = require("path"),
	mimeType = require("mime"),
	q = require("q");
	AWS = require("aws-sdk");

module.exports = {
	properties: [{
		name: "bucket",
		desc: "The name of your S3 bucket."
	}, {
		name: "configPath",
		desc: "Relative path to the file containing the object: "
			+ "{accessKeyId, secretAccessKey}."
	}],

	deploy: function(options, files, error) {
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
			AWS.config.loadFromPath(path.resolve(options["configPath"]));
		} catch (e) {
			error(e.message);
		}

		var S3 = new AWS.S3();

		var bucket = options["bucket"];
		bucketExists(bucket).then(function(value){
			uploadFiles(files, bucket);
		}, function(err) {
			createBucket(bucket).then(function(value) {
				uploadFiles(files, bucket)
			}, function(err) {
				error(err);
			});
		});
	}
}
