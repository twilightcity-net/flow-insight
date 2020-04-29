let hypercore = require("hypercore");
let hyperdiscovery = require("hyperdiscovery");
var ram = require("random-access-memory");
let dir = "./cores/swarmtest";
let opts = {
  sparse: true,
  valueEncoding: "json"
};
// let feed = hypercore(dir, opts);
let feed = hypercore(function(filename) {
  // filename will be one of: data, bitfield, tree, signatures, key, secret_key
  // the data file will contain all your data concatenated.

  // just store all files in ram by returning a random-access-memory instance
  // console.log(" [ FEED ] filename: ", filename);
  return ram();
});
let phrase = process.argv[2] || "testing";
let swarm = null;

feed.on("ready", function() {
  console.log(
    "[ CONNECTING ] feed : " + feed.key.toString("hex")
  );

  swarm = hyperdiscovery(feed);
  swarm.on("connection", function(peer, type) {
    console.log("[ SWARM ] peer connection");
  });
});

// auto generate data to post to the feed
setInterval(() => {
  let data = {
    item: phrase,
    timestamp: new Date().toLocaleString()
  };
  var buff = Buffer.from(JSON.stringify(data));
  feed.append(buff, function(err, seq) {
    console.log("[ FEED ] append :", seq + 1, data);
  });
}, 3000);
