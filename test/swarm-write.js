let hypercore = require("hypercore");
let hyperdiscovery = require("hyperdiscovery");
let dir = "./cores/swarmtest";
let opts = {
  sparse: true,
  valueEncoding: "json"
};
let feed = hypercore(dir, opts);
let phrase = process.argv[2] || "testing";
let swarm = null;

feed.on("ready", function() {
  console.log("[ CONNECTING ] feed : " + feed.key.toString("hex"));

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
  feed.append(data, function(err, seq) {
    console.log("[ FEED ] append :", seq + 1, data);
  });
}, 10000);
