const assert = require("assert");
const chai = require("chai");
const request = require("superagent");
const Util = require("../UtilTest");
const ActivationCodeDto = require("../../public/dto/ActivationCodeDto");
const AccountActivationDto = require("../../public/dto/AccountActivationDto");

//globals
const port = process.env.PORT || 5000;
const apiUrlLocal = "http://localhost:" + port;
const apiUrlRemote = "http://home.twilightcity.net";

// TODO add tests for DataManager to be implemented
describe("API Resource : /account ", function () {
  let apiKey = "123e4567-e89b-12d3-a456-426655440000";
  describe("POST /account/activate", function () {
    let msg =
      "Your account has been successfully activated.";
    let status = "VALID";
    let email = "admin@twilightcity.net";
    let key = "FASFD423fsfd32d2322d";
    let token = "abcd12345678";
    let dtoReq = new ActivationCodeDto({
      activationCode: token,
    });
    let dtoRes = new AccountActivationDto({
      status: status,
      message: msg,
      email: email,
      apiKey: key,
    });
    let localDtoRes = null;
    let remoteDtoRes = null;

    it("should use dto 'ActivationTokenDto' for request", function (done) {
      chai.should();
      testDtoReq(dtoReq, token);
      done();
    });

    it("should use dto 'AccountActivationDto' for response", function (done) {
      chai.should();
      testDtoRes(dtoRes, status, msg, email, key);
      done();
    });

    it("should return 'AccountActivationDto' on local POST", function (done) {
      chai.should();
      request
        .post(apiUrlLocal + "/account/activate")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          localDtoRes = new AccountActivationDto(res.body);
          testDtoRes(localDtoRes, status, msg, email, key);
          done();
        });
    });

    it("should return 'AccountActivationDto' on remote POST", function (done) {
      chai.should();
      request
        .post(apiUrlRemote + "/account/activate")
        .send(dtoReq)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          Util.checkRequestError(err);
          remoteDtoRes = new AccountActivationDto(res.body);
          testDtoRes(remoteDtoRes, status, msg, email, key);
          done();
        });
    });

    it("expect 'AccountActivationDto' to be equal", function (done) {
      var expect = chai.expect;
      expect(localDtoRes).to.eql(remoteDtoRes);
      done();
    });
  });
});

function testDtoReq(dto, token) {
  dto.should.have
    .property("activationToken")
    .with.be.a("string")
    .with.equal(token);
}

function testDtoRes(dto, status, msg, email, key) {
  dto.should.have
    .property("status")
    .with.be.a("string")
    .with.equal(status);
  dto.should.have
    .property("message")
    .with.be.a("string")
    .with.equal(msg);
  dto.should.have
    .property("email")
    .with.be.a("string")
    .with.equal(email);
  dto.should.have
    .property("apiKey")
    .with.be.a("string")
    .with.equal(key);
}
