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
  let apiKey = "123e4567-e89b-12d3-a456-426655440000";
  describe("POST /account/activate", function() {
    let responseMsg = "Your account has been successfully activated.";
    let responseStatus = "VALID";
    let responseEmail = "kara@dreamscale.io";
    let responseKey = "FASFD423fsfd32d2322d";
    let responseToken = "abcd12345678";
    let dtoReq = new ActivationTokenDto({
      activationToken: responseToken
    });
    let dtoRes = new AccountActivationDto({
      status: responseStatus,
      message: responseMsg,
      email: responseEmail,
      apiKey: responseKey
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'ActivationTokenDto' for request", function(done) {
      chai.should();
      dtoReq.should.have
        .property("activationToken")
        .with.be.a("string")
        .with.equal(responseToken);
      done();
    });

    it("should use dto 'AccountActivationDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal(responseStatus);
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal(responseMsg);
      dtoRes.should.have
        .property("email")
        .with.be.a("string")
        .with.equal(responseEmail);
      dtoRes.should.have
        .property("apiKey")
        .with.be.a("string")
        .with.equal(responseKey);
      done();
    });

    it("should return 'AccountActivationDto' on local POST", function(done) {
      chai.should();
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
            .with.equal(responseStatus);
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          localResponseDto.should.have
            .property("email")
            .with.be.a("string")
            .with.equal(responseEmail);
          localResponseDto.should.have
            .property("apiKey")
            .with.be.a("string")
            .with.equal(responseKey);
          done();
        });
    });

    it("should return 'AccountActivationDto' on remote POST", function(done) {
      chai.should();
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
            .with.equal(responseStatus);
          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          remoteResponseDto.should.have
            .property("email")
            .with.be.a("string")
            .with.equal(responseEmail);
          remoteResponseDto.should.have
            .property("apiKey")
            .with.be.a("string")
            .with.equal(responseKey);
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
    let responseMsg = "Everything is awesome";
    let responseStatus = "VALID";
    let requestIdleTime = "0";
    let requestDeltaTime = "0";
    let dtoReq = new HeartbeatDto({
      idleTime: requestIdleTime,
      deltaTime: requestDeltaTime
    });
    let dtoRes = new SimpleStatusDto({
      message: responseMsg,
      status: responseStatus
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'HeartbeatDto' for request", function(done) {
      chai.should();
      dtoReq.should.have
        .property("idleTime")
        .with.be.a("string")
        .with.equal(requestIdleTime);
      dtoReq.should.have
        .property("deltaTime")
        .with.be.a("string")
        .with.equal(requestDeltaTime);
      done();
    });

    it("should use dto 'SimpleStatusDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal(responseMsg);
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal(responseStatus);
      done();
    });

    it("should return 'SimpleStatusDto' on local POST", function(done) {
      chai.should();
      request
        .post(apiUrlLocal + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          localResponseDto = new SimpleStatusDto(res.body);
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          localResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("should return 'SimpleStatusDto' on remote POST", function(done) {
      chai.should();
      request
        .post(apiUrlRemote + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteResponseDto = new SimpleStatusDto(res.body);

          //////////////////////////////////////////////////////////////
          /// This fails now until the server returns back test data ///
          //////////////////////////////////////////////////////////////

          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          remoteResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("expect 'SimpleStatusDto' to be equal", function(done) {
      var expect = chai.expect;

      //////////////////////////////////////////////////////////////
      /// This fails now until the server returns back test data ///
      //////////////////////////////////////////////////////////////

      expect(localResponseDto).to.eql(remoteResponseDto);
      done();
    });
  });

  describe("POST /account/login", function() {
    let responseMsg = "Successfully logged in";
    let responseStatus = "VALID";
    let dtoRes = new SimpleStatusDto({
      message: responseMsg,
      status: responseStatus
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'SimpleStatusDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal(responseMsg);
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal(responseStatus);
      done();
    });

    it("should return 'SimpleStatusDto' on local POST", function(done) {
      chai.should();
      request
        .post(apiUrlLocal + "/account/login")
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          localResponseDto = new SimpleStatusDto(res.body);
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          localResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("should return 'SimpleStatusDto' on remote POST", function(done) {
      chai.should();
      request
        .post(apiUrlRemote + "/account/login")
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteResponseDto = new SimpleStatusDto(res.body);

          //////////////////////////////////////////////////////////////
          /// This fails now until the server returns back test data ///
          //////////////////////////////////////////////////////////////

          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          remoteResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("expect 'SimpleStatusDto' to be equal", function(done) {
      var expect = chai.expect;

      //////////////////////////////////////////////////////////////
      /// This fails now until the server returns back test data ///
      //////////////////////////////////////////////////////////////

      expect(localResponseDto).to.eql(remoteResponseDto);
      done();
    });
  });

  describe("POST /account/logout", function() {
    let responseMsg = "Successfully logged out";
    let responseStatus = "VALID";
    let dtoRes = new SimpleStatusDto({
      message: responseMsg,
      status: responseStatus
    });
    let localResponseDto = null;
    let remoteResponseDto = null;

    it("should use dto 'SimpleStatusDto' for response", function(done) {
      chai.should();
      dtoRes.should.have
        .property("message")
        .with.be.a("string")
        .with.equal(responseMsg);
      dtoRes.should.have
        .property("status")
        .with.be.a("string")
        .with.equal(responseStatus);
      done();
    });

    it("should return 'SimpleStatusDto' on local POST", function(done) {
      chai.should();
      request
        .post(apiUrlLocal + "/account/logout")
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          localResponseDto = new SimpleStatusDto(res.body);
          localResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          localResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("should return 'SimpleStatusDto' on remote POST", function(done) {
      chai.should();
      request
        .post(apiUrlRemote + "/account/logout")
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteResponseDto = new SimpleStatusDto(res.body);

          //////////////////////////////////////////////////////////////
          /// This fails now until the server returns back test data ///
          //////////////////////////////////////////////////////////////

          remoteResponseDto.should.have
            .property("message")
            .with.be.a("string")
            .with.equal(responseMsg);
          remoteResponseDto.should.have
            .property("status")
            .with.be.a("string")
            .with.equal(responseStatus);
          done();
        });
    });

    it("expect 'SimpleStatusDto' to be equal", function(done) {
      var expect = chai.expect;

      //////////////////////////////////////////////////////////////
      /// This fails now until the server returns back test data ///
      //////////////////////////////////////////////////////////////

      expect(localResponseDto).to.eql(remoteResponseDto);
      done();
    });
  });
});
