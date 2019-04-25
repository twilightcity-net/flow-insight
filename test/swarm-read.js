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

  swarm.on("peer", peer => {
    logPeerEvents(swarm, "peer", peer);
  });
  swarm.on("peer-banned", (peerAddress, details) => {
    logPeerEvents(swarm, "peer-banned", peerAddress, details);
  });
  swarm.on("peer-rejected", (peerAddress, details) => {
    logPeerEvents(swarm, "peer-rejected", peerAddress, details);
  });
  swarm.on("drop", peer => {
    logPeerEvents(swarm, "drop", peer);
  });
  swarm.on("connecting", peer => {
    logPeerEvents(swarm, "connecting", peer);
  });
  swarm.on("connect-failed", (peer, details) => {
    logPeerEvents(swarm, "connect-failed", peer, details);
  });

  swarm.on("handshaking", (connection, info) => {
    logSwarmEvents(swarm, "handshaking", connection, info);
  });
  swarm.on("handshake-timeout", (connection, info) => {
    logSwarmEvents(swarm, "handshake-timeout", connection, info);
  });
  swarm.on("connection", (connection, info) => {
    logSwarmEvents(swarm, "connection", connection, info);
  });
  swarm.on("connection-closed", (connection, info) => {
    logSwarmEvents(swarm, "connection-closed", connection, info);
  });
  swarm.on("redundant-connection", (connection, info) => {
    logSwarmEvents(swarm, "redundant-connection", connection, info);
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
    console.log(
      "[ STREAM ] size = %d | ping = %s : data =",
      feed.length,
      calcPing(data.timestamp),
      data
    );
  });
});

function calcPing(startTime) {
  return Date.now() - startTime;
}

function logPeerEvents(swarm, event, peer, details) {
  console.log(
    "[PEER] peer %s:%s | event=%s | (%s peers) | swarm=%s | (%s)",
    peer.host,
    peer.port,
    event.toUpperCase() + (details ? "(" + JSON.stringify(details) + ")" : ""),
    swarm.connections ? swarm.connections.length : null,
    peer.discoveryKey ? peer.discoveryKey.toString("hex") : null,
    peer.id ? peer.id.toString("hex") : null
  );
}

function logSwarmEvents(swarm, event, connection, info) {
  console.log(
    "[SWARM] [%s] peer %s:%s | event=%s | (%s peers) | swarm=%s | connection=%s",
    info.type ? info.type.toUpperCase() : null,
    info.host,
    info.port,
    event.toUpperCase(),
    swarm.connections ? swarm.connections.length : null,
    connection.discoveryKey ? connection.discoveryKey.toString("hex") : null,
    connection.id ? connection.id.toString("hex") : null
  );
}
