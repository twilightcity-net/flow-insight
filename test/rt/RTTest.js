const RTManager = require("../../public/managers/TalkManager");

function testRT() {
  let rt = new RTManager();
  rt.createConnection();
}

testRT();
