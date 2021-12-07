const assert = require("assert");
const chai = require("chai");
const Util = require("../UtilTest");
const hypercore = require("hypercore");

// TODO add tests for DataManager to be implemented
describe("HYPERCORE Resource", function () {
  it("should run hypercore in ./tmp dir", function (done) {
    chai.should();
    testHypercore();
    done();
  });
});

function testHypercore() {
  var feed = hypercore("./tmp", { valueEncoding: "json" });

  feed.append({
    hello: "world",
  });

  feed.append({
    hej: "verden",
  });

  feed.append({
    hola: "mundo",
  });

  feed.flush(function () {
    console.log(
      "Appended 3 more blocks, %d in total (%d bytes)\n",
      feed.length,
      feed.byteLength
    );

    feed
      .createReadStream()
      .on("data", console.log)
      .on("end", console.log.bind(console, "\n(end)"));
  });
}
