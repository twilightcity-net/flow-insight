const assert = require("assert");
const chai = require("chai");
const request = require("superagent");
const Util = require("../UtilTest");
const ActivationTokenDto = require("../../public/dto/ActivationTokenDto");
const AccountActivationDto = require("../../public/dto/AccountActivationDto");
const HeartbeatDto = require("../../public/dto/HeartbeatDto");
const SimpleStatusDto = require("../../public/dto/SimpleStatusDto");

//globals
const apiUrlLocal = "http://localhost:5000";
const apiUrlRemote = "http://htmflow.dreamscale.io";

// TODO add tests for DataManager to be implemented
describe("API Resource : /account ", function() {
  describe("POST /account/activate", function() {
    let dtoReq = new ActivationTokenDto({
      activationToken: "abcd12345678"
    });
    let dtoRes = new AccountActivationDto({
      status: "VALID",
      message: "Your account has been successfully activated.",
      email: "kara@dreamscale.io",
      apiKey: "FASFD423fsfd32d2322d"
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'ActivationTokenDto' for request", function(done) {
      chai.should();
      dtoReq.should.have
        .property("activationToken")
        .with.be.a("string")
        .with.equal("abcd12345678");
      done();
    });

    it("should use dto 'AccountActivationDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal("VALID");
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal("Your account has been successfully activated.");
      dtoRes.should.have
        .property("email")
        .with.be.a("string")
        .with.equal("kara@dreamscale.io");
      dtoRes.should.have
        .property("apiKey")
        .with.be.a("string")
        .with.equal("FASFD423fsfd32d2322d");
      done();
    });

    it("should return 'AccountActivationDto' on local POST", function(done) {
      chai.should();

      //local
      request
        .post(apiUrlLocal + "/account/activate")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          localResponseDto = new AccountActivationDto(res.body);
          localResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Your account has been successfully activated.");
          localResponseDto.should.have
            .property("email")
            .with.be.a("string")
            .with.equal("kara@dreamscale.io");
          localResponseDto.should.have
            .property("apiKey")
            .with.be.a("string")
            .with.equal("FASFD423fsfd32d2322d");
          done();
        });
    });

    it("should return 'AccountActivationDto' on remote POST", function(done) {
      chai.should();

      //remote
      request
        .post(apiUrlRemote + "/account/activate")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteResponseDto = new AccountActivationDto(res.body);
          remoteResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Your account has been successfully activated.");
          remoteResponseDto.should.have
            .property("email")
            .with.be.a("string")
            .with.equal("kara@dreamscale.io");
          remoteResponseDto.should.have
            .property("apiKey")
            .with.be.a("string")
            .with.equal("FASFD423fsfd32d2322d");
          done();
        });
    });

    it("expect 'AccountActivationDto' to be equal", function(done) {
      var expect = chai.expect;
      expect(localResponseDto).to.eql(remoteResponseDto);
      done();
    });
  });

  describe("POST /account/heartbeat", function() {
    let dtoReq = new HeartbeatDto({
      idleTime: "0",
      deltaTime: "0"
    });
    let dtoRes = new SimpleStatusDto({
      message: "Everything is awesome",
      status: "VALID"
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'HeartbeatDto' for request", function(done) {
      chai.should();
      dtoReq.should.have
        .property("idleTime")
        .with.be.a("string")
        .with.equal("0");
      dtoReq.should.have
        .property("deltaTime")
        .with.be.a("string")
        .with.equal("0");
      done();
    });

    it("should use dto 'SimpleStatusDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal("Everything is awesome");
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal("VALID");
      done();
    });

    it("should return 'SimpleStatusDto' on local POST", function(done) {
      chai.should();

      //local
      request
        .post(apiUrlLocal + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", "123e4567-e89b-12d3-a456-426655440000")
        .end((err, res) => {
          Util.checkRequestError(err);
          localResponseDto = new SimpleStatusDto(res.body);
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Everything is awesome");
          localResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          done();
        });
    });

    it("should return 'SimpleStatusDto' on remote POST", function(done) {
      chai.should();

      //remote
      request
        .post(apiUrlRemote + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", "123e4567-e89b-12d3-a456-426655440000")
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteResponseDto = new SimpleStatusDto(res.body);

          //////////////////////////////////////////////////////////////
          /// This fails now until the server returns back test data ///
          //////////////////////////////////////////////////////////////

          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal("Everything is awesome");
          remoteResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal("VALID");
          done();
        });
    });

    it("expect 'AccountActivationDto' to be equal", function(done) {
      var expect = chai.expect;

      //////////////////////////////////////////////////////////////
      /// This fails now until the server returns back test data ///
      //////////////////////////////////////////////////////////////

      expect(localResponseDto).to.eql(remoteResponseDto);
      done();
    });
  });
});
