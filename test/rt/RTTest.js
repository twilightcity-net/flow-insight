const RTManager = require("../../public/managers/RTFlowManager");

function testRT() {
  let rt = new RTManager();
  rt.createConnection();
}

testRT();