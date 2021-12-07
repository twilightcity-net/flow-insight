const assert = require("assert");
const chai = require("chai");
const request = require("superagent");
const Util = require("../UtilTest");
const HeartbeatDto = require("../../public/dto/HeartbeatDto");
const SimpleStatusDto = require("../../public/dto/SimpleStatusDto");

//globals
const port = process.env.PORT || 5000;
const apiUrlLocal = "http://localhost:" + port;
const apiUrlRemote = "http://home.twilightcity.net";

// TODO add tests for DataManager to be implemented
describe("API Resource : /account ", function () {
  let apiKey = "123e4567-e89b-12d3-a456-426655440000";

  describe("POST /account/heartbeat", function () {
    let msg = "Everything is awesome";
    let status = "VALID";
    let idleTime = "0";
    let deltaTime = "0";
    let dtoReq = new HeartbeatDto({
      idleTime: idleTime,
      deltaTime: deltaTime,
    });
    let dtoRes = new SimpleStatusDto({
      message: msg,
      status: status,
    });
    let localDtoRes = null;
    let remoteDtoRes = null;

    it("should use dto 'HeartbeatDto' for request", function (done) {
      chai.should();
      testDtoReq(dtoReq, idleTime, deltaTime);
      done();
    });

    it("should use dto 'SimpleStatusDto' for response", function (done) {
      chai.should();
      testDtoRes(dtoRes, msg, status);
      done();
    });

    it("should return 'SimpleStatusDto' on local POST", function (done) {
      chai.should();
      request
        .post(apiUrlLocal + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          localDtoRes = new SimpleStatusDto(res.body);
          testDtoRes(localDtoRes, msg, status);
          done();
        });
    });

    //////////////////////////////////////////////////////////////
    /// This fails now until the server returns back test data ///
    //////////////////////////////////////////////////////////////

    it("should return 'SimpleStatusDto' on remote POST", function (done) {
      chai.should();
      request
        .post(apiUrlRemote + "/account/heartbeat")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .set("X-API-Key", apiKey)
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteDtoRes = new SimpleStatusDto(res.body);
          testDtoRes(remoteDtoRes, msg, status);
          done();
        });
    });

    //////////////////////////////////////////////////////////////
    /// This fails now until the server returns back test data ///
    //////////////////////////////////////////////////////////////

    it("expect 'SimpleStatusDto' to be equal", function (done) {
      var expect = chai.expect;
      expect(localDtoRes).to.eql(remoteDtoRes);
      done();
    });
  });
});

function testDtoReq(dto, idleTime, deltaTime) {
  dto.should.have
    .property("idleTime")
    .with.be.a("string")
    .with.equal(idleTime);
  dto.should.have
    .property("deltaTime")
    .with.be.a("string")
    .with.equal(deltaTime);
}

function testDtoRes(dto, msg, status) {
  dto.should.have
    .property("message")
    .with.be.a("string")
    .with.equal(msg);
  dto.should.have
    .property("status")
    .with.be.a("string")
    .with.equal(status);
}
