const assert = require("assert");
const chai = require("chai");
const request = require("superagent");

describe("API Resource : /account ", function() {
  describe("POST -> /account/activate", function() {
    it("should return 'AccountActivationDto' on POST request", function(done) {
      request
        .post("http://localhost:5000/account/activate")
        .send({ activationToken: "abcd12345678" })
        .set("Content-Type", "application/json")
        .end((err, res) => {
          chai.should();
          if (err) err.should.equal(null);
          done();
        });
    });
  });

  describe("POST -> /account/heartbeat", function() {
    it("should return 'AccountActivationDto' on POST request", function(done) {
      request
        .post("http://localhost:5001/account/activate")
        .send({ activationToken: "abcd12345678" })
        //.set('X-API-Key', 'foobar')
        .set("Content-Type", "application/json")
        .end((err, res) => {
          chai.should();
          if (err) err.should.equal(null);
          done();
        });

      // assert.equal([1, 2, 3].indexOf(4), -1);
      // done();
    });
  });
});
