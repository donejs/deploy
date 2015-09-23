var assert = require("assert");
var deploy = require("../deploy");
var nock = require("nock");
var AWS = require("aws-sdk");

describe("s3", function(){
	beforeEach(function(){
		nock("https://foobar.fake-s3")
			.head("/")
			.reply(200)
			.post("/")
			.reply(200, {});
	});

	it("using environment variables works", function(done){
		AWS.config.update({
			endpoint: "https://fake-s3"
		});

		var pkg = {};
		var deployConfig = {
			root: __dirname + "/tests/dist",
			services: {
				production: {
					type: "s3",
					bucket: "foobar"
				}
			}
		};
		pkg.donejs = { deploy: deployConfig };
		process.env.S3_ACCESS_KEY_ID = "foo";
		process.env.S3_SECRET_ACCESS_KEY = "bar";

		deploy(pkg).then(function(){
			assert(true, "request finished successfully");
			done();
		});
	});
});
