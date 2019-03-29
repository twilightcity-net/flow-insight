var hypercore = require("hypercore");
// lets you to find other hyper* peers
var hyperdiscovery = require("hyperdiscovery");
// lets you to write to memory as if you are writing to a file
var ram = require("random-access-memory");

// pass in the key that's printed from swarm-write.js
var key = process.argv[2];
if (!key) {
  console.log(
    "usage: node swarm-read.js <key from swarm-write.js|other hypercore key>"
  );
  process.exit();
}
// we pass the ram as storage to skip creating (and consequently cleaning up after) lots of folders
var feed = hypercore(ram, key, { valueEncoding: "json" });
var swarm = null;

// called when the core system is initialized
feed.on("ready", function() {
  console.log("[ CONNECTING ] feed : " + feed.key.toString("hex"));

  // we need to join the swarm to be able to find other peers
  swarm = hyperdiscovery(feed, { live: true });

  // triggered when a peer connects
  swarm.on("connection", function(peer, type) {
    console.log("[ SWARM ] peer connection");
  });
});

// wait for the feed to update before setting up a stream to list on.
feed.update(function() {
  console.log("[ FEED ] length : ", feed.length);

  // create the stream to listen on for events.
  var stream = feed.createReadStream({
    tail: true, // sets `start` to `feed.length`
    live: true // set to true to keep reading forever
  });
  stream.on("data", function(data) {
    console.log("[ FEED ] stream : ", feed.length, data);
  });
});
