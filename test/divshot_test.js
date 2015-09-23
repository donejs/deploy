var assert = require("assert");
var deploy = require("../deploy");
var nock = require("nock");
var AWS = require("aws-sdk");

describe("divshot", function(){
	beforeEach(function(){
		var auth = "eyJzZWNyZXQiOiJmb28iLCJrZXkiOiJiYXIiLCJ0b2tlbiI6InF1eCJ9";
		nock("https://api.divshot.com")
			.post("/apps/fake-thing/builds")
			.reply(200, { loadpoint: { authorization: auth }})
			.post("/apps")
			.reply(200, {})
			.put("/apps/fake-thing/builds/finalize")
			.reply(200, {})
			.post("/apps/fake-thing/releases/production")
			.reply(200, {});

		nock('https://divshot-io-hashed-production.s3.amazonaws.com:443')
		  .head('//e67e72111b363d80c8124d28193926000980e1211c7986cacbd26aacc5528d48')
		  .reply(200, "", { 'x-amz-request-id': '1460749D5F2DFCBA',
		  'x-amz-id-2': '9g8cVh71YqnyJ9s3KGFmCGabk58PBa+0faMwyJnGGNOINniryFQ//KO+yhaH07ZkvN9+PO8gn2M=',
		  'content-type': 'application/xml',
		  'transfer-encoding': 'chunked',
		  date: 'Wed, 23 Sep 2015 00:55:55 GMT',
		  server: 'AmazonS3' });
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
					type: "divshot",
					environment: "production",
					config: {
						name: "fake-thing"
					}
				}
			}
		};
		pkg.donejs = { deploy: deployConfig };
		process.env.DIVSHOT_TOKEN = "foo";

		deploy(pkg).then(function(){
			assert(true, "request finished successfully");
			done();
		});
	});
});
