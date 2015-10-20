var assert = require("assert");
var deploy = require("../deploy");
var nock = require("nock");

describe("firebase", function(){
	beforeEach(function() {
        nock("https://admin.firebase.com")
            .get("/firebase/fake-test/token?token=-K14RVPW-tJxMerR3nWa67244180046f")
            .reply(200, {});

        nock("https://deploy.firebase.com")
            .put("/firebase/fake-test/uploads/")
            .reply(200, {"success":true,"version":"-K15dSA44oNvx_0FjD5x"})
            .post("/firebase/radiant-fire-2175/releases")
            .reply(200, {"hosting":"-K15dSA44oNvx_0FjD5x"});


		// var auth = "eyJzZWNyZXQiOiJmb28iLCJrZXkiOiJiYXIiLCJ0b2tlbiI6InF1eCJ9";
		// nock("https://api.divshot.com")
		// 	.post("/apps/fake-thing/builds")
		// 	.reply(200, { loadpoint: { authorization: auth }})
		// 	.post("/apps")
		// 	.reply(200, {})
		// 	.put("/apps/fake-thing/builds/finalize")
		// 	.reply(200, {})
		// 	.post("/apps/fake-thing/releases/production")
		// 	.reply(200, {});
        //
		// nock('https://divshot-io-hashed-production.s3.amazonaws.com:443')
		//   .head('//e67e72111b363d80c8124d28193926000980e1211c7986cacbd26aacc5528d48')
		//   .reply(200, "", { 'x-amz-request-id': '1460749D5F2DFCBA',
		//   'x-amz-id-2': '9g8cVh71YqnyJ9s3KGFmCGabk58PBa+0faMwyJnGGNOINniryFQ//KO+yhaH07ZkvN9+PO8gn2M=',
		//   'content-type': 'application/xml',
		//   'transfer-encoding': 'chunked',
		//   date: 'Wed, 23 Sep 2015 00:55:55 GMT',
		//   server: 'AmazonS3' });
	});

	it("using an env variable works", function(done){
		var pkg = {};
		var deployConfig = {
			root: __dirname + "/tests/dist",
			services: {
				developement: {
					type: "firebase",
					config: {
						"firebase": "fake-test",
						"public": __dirname + "/tests/dist",
						"ignore": [
                            "firebase.json",
                            "**/.*",
                            "**/node_modules/**"
                        ]
					}
				}
			}
		};
		pkg.donejs = { deploy: deployConfig };
		process.env.FIREBASE_TOKEN = "-K14RVPW-tJxMerR3nWa67244180046f";

		deploy(pkg).then(function(){
			assert(true, "request finished successfully");
			done();
		}, function(err){
			console.error(err);
			assert(false, "an error");
			done();
		});
	});
});
