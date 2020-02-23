const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {TalkDB}
 */
module.exports = class TalkDB extends LokiJS {
  constructor() {
    super("talk");
    this.name = "[DB.Talk]";
    this.guid = Util.getGuid();
    let users = this.addCollection("users", { indices: ["email"] });
    let odin = users.insert({
      name: "odin",
      email: "odin.soap@lokijs.org",
      age: 38
    });
    let thor = users.insert({
      name: "thor",
      email: "thor.soap@lokijs.org",
      age: 25
    });
    let stan = users.insert({
      name: "stan",
      email: "stan.soap@lokijs.org",
      age: 29
    });
    let oliver = users.insert({
      name: "oliver",
      email: "oliver.soap@lokijs.org",
      age: 31
    });
    let hector = users.insert({
      name: "hector",
      email: "hector.soap@lokijs.org",
      age: 15
    });
    let achilles = users.insert({
      name: "achilles",
      email: "achilles.soap@lokijs.org",
      age: 31
    });

    var dv = users.addDynamicView("a_complex_view");
    dv.applyWhere(function aCustomFilter(obj) {
      return obj.name.length < 5 && obj.age > 30;
    });
    //view the data
    console.log(dv.data());

    // apply some changes
    users.insert({ name: "rata", email: "rata@tosk.r", age: 10320 });
    // behold the dynamicview updating itself by inspecting the data
    console.log(dv.data());
  }
};
