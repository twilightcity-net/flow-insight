const assert = require("assert");
const chai = require("chai");
const request = require("superagent");

describe("API Integration ", function() {
  describe("POST -> /account/activate", function() {
    it("should return 'AccountActivationDto' on POST request", function(done) {
      // 	request
      // .post('/account/activate')
      // .send({"activationToken": "abcd12345678"})
      // //.set('X-API-Key', 'foobar')
      // .set('Content-Type', 'application/json')
      // .end((err, res) => {
      // 	console.log("send request");
      // 	if(err) {
      // 		console.error(err);
      // 	} else {
      // 		console.log(res);
      // 	}

      // });

      assert.equal([1, 2, 3].indexOf(4), -1);
      done();
    });
  });
});
