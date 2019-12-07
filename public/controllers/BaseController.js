const Util = require("../Util");

/**
 * This class is used to coordinate controllers across the app classes
 */
module.exports = class BaseController {
  constructor(name, scope, clazz) {
    this.name = name;
    this.scope = scope;
    this.class = clazz;
    this.guid = Util.getGuid();
    clazz.instance = this;
  }

  /// setup the class and static link it if doesn't exist
  static init(scope, childClass) {
    if (!childClass.instance) {
      childClass.instance = childClass;
      // childClass.instance.childClass = childClass;
      childClass.instance.wireControllersTogether();
    }
    return BaseController.instance;
  }

  /// for override
  wireControllersTogether() {
    // TODO add shared controller code here
  }

  /// for override
  configureEvents() {
    /// TODO add shared events / global events here
  }

  test() {
    console.log("********");
  }
};
