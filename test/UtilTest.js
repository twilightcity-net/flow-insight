const chai = require("chai");

module.exports = class UtilTest {
  static checkRequestError(err) {
    chai.should();
    if (err) {
      if (err.response)
        throw new Error(
          "[" +
            err.response.statusCode +
            "] " +
            err.response.text
        );
      err.should.equal(null);
    }
  }
};
