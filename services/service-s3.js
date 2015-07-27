var fs = require("fs"),
	mimeType = require("node-mime"),
	q = require("q");
	AWS = require("aws-sdk"),
	S3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
	name: "S3",
	deploy: function(options, done) {
		var bucketExists = function(bucketName) {
			console.log("Checking for the existence of " + bucketName);

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
			console.log("Bucket not found. Creating bucket " + bucketName);

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
			var fileBuffer = fs.readFileSync(path);
			var contentType = mimeType.lookup(path);

			S3.putObject({
				ACL: "public-read",
				Bucket: bucket,
				Key: path,
				Body: fileBuffer,
				ContentType: contentType
			}, function(error, data) {
				console.log("Uploaded: " + path);
				console.log(arguments);
			});
		};
	}
};
