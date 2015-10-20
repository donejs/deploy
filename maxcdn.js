var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
  console.log('Client :: ready');
  conn.sftp(function(err, sftp) {
    if (err) throw err;

	sftp.fastPut(__dirname + "/package.json", "public_html/package.json", function(err){
		if(err) throw err;

		console.log("all done");
	});
  });
}).connect({
	host: "netdna-cdn.com",
	username: "something",
	password: "foopass"
});

/*var SFTPS = require('sftps');
var sftp = new SFTPS({
	host: "ftp.foozone.bitovi1.netdna-cdn.com",
	username: "foozone.bitovi1",
	password: "robotchairswing"
  //host: 'domain.com', // required
  //username: 'Test', // required
  //password: 'Test', // required
  //port: 22 // optional
});

sftp.addFile(__dirname + "/package.json").exec(console.log);*/
