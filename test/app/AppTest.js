const chai = require("chai");
const BaseController = require("../../public/controllers/BaseController");
const AppController = require("../../public/controllers/AppController");

describe("app.controllers", function() {
  it("should test [BaseController]", function(done) {
    chai.should();
    testBaseControllerClass();
    done();
  });
  it("should test [AppController]", function(done) {
    chai.should();
    testAppController();
    done();
  });
});

function testBaseControllerClass() {
  let baseClass = new BaseController(
    "[BaseController]",
    this,
    Object
  );

  ///  test for the static instance
  baseClass.should.not.have
    .property("instance")
    .with.be.a("Object");
  Object.should.have
    .property("instance")
    .with.be.a("Object");

  /// test for name property in static instance
  baseClass.should.not.have.property("instance");
  Object.instance.should.have
    .property("name")
    .with.be.a("string")
    .with.equal("[BaseController]");
}

function testAppController() {
  // let appController = new AppController(this, "[AppController]");
}
