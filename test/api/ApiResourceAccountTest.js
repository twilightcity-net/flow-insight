const assert = require("assert");
const chai = require("chai");
const request = require("superagent");
const Util = require("../UtilTest");
const ActivationTokenDto = require("../../public/dto/ActivationTokenDto");
const AccountActivationDto = require("../../public/dto/AccountActivationDto");
const HeartbeatDto = require("../../public/dto/HeartbeatDto");
const SimpleStatusDto = require("../../public/dto/SimpleStatusDto");

describe("API Resource : /account ", function() {
  describe("POST /account/activate", function() {
    it("should use dto 'ActivationTokenDto' for request", function(done) {
      let dto = new ActivationTokenDto({
        activationToken: "abcd12345678"
      });
      chai.should();
      dto.should.have
        .property("activationToken")
        .with.be.a("string")
        .with.equal("abcd12345678");
      done();
    });

    it("should use dto 'AccountActivationDto' for request", function(done) {
      let dto = new AccountActivationDto({
        status: "VALID",
        message: "Your account has been successfully activated.",
        email: "kara@dreamscale.io",
        apiKey: "FASFD423fsfd32d2322d"
      });
      chai.should();
      dto.should.have
        .property("status")
        .with.be.a("string")
        .with.equal("VALID");
      dto.should.have
        .property("message")
        .with.be.a("string")
        .with.equal("Your account has been successfully activated.");
      dto.should.have
        .property("email")
        .with.be.a("string")
        .with.equal("kara@dreamscale.io");
      dto.should.have
        .property("apiKey")
        .with.be.a("string")
        .with.equal("FASFD423fsfd32d2322d");
      done();
    });

    it("should return 'AccountActivationDto' on POST request", function(done) {
      chai.should();
      let dto = new ActivationTokenDto({
        activationToken: "abcd12345678"
      });
      request
        .post("http://localhost:5000/account/activate")
        .send(dto)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          dto = new AccountActivationDto(res.body);
          dto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          dto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Your account has been successfully activated.");
          dto.should.have
            .property("email")
            .with.be.a("string")
            .with.equal("kara@dreamscale.io");
          dto.should.have
            .property("apiKey")
            .with.be.a("string")
            .with.equal("FASFD423fsfd32d2322d");
          done();
        });
    });
  });

  describe("POST /account/heartbeat", function() {
    it("should use dto 'HeartbeatDto' for request", function(done) {
      let dto = new HeartbeatDto({
        idleTime: "0",
        deltaTime: "0"
      });
      chai.should();
      dto.should.have
        .property("idleTime")
        .with.be.a("string")
        .with.equal("0");
      dto.should.have
        .property("deltaTime")
        .with.be.a("string")
        .with.equal("0");
      done();
    });

    it("should use dto 'SimpleStatusDto' for request", function(done) {
      let dto = new SimpleStatusDto({
        message: "Everything is awesome",
        status: "VALID"
      });
      chai.should();
      dto.should.have
        .property("message")
        .with.be.a("string")
        .with.equal("Everything is awesome");
      dto.should.have
        .property("status")
        .with.be.a("string")
        .with.equal("VALID");
      done();
    });

    /// test the actual request
    it("should return 'SimpleStatusDto' on POST request", function(done) {
      chai.should();
      let dto = new HeartbeatDto({
        idleTime: "0",
        deltaTime: "0"
      });
      request
        .post("http://localhost:5000/account/heartbeat")
        .send(dto)
        .set("X-API-Key", "123e4567-e89b-12d3-a456-426655440000")
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          dto = new SimpleStatusDto(res.body);
          dto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Everything is awesome");
          dto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          done();
        });
    });
  });
});
