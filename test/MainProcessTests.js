//TESTING LOGIC
function testEventManager() {
  log.info("EventManager : test()");

  let testEventA = new MainEvent(
    EventManager.EventTypes.TEST_EVENT,
    this,
    function(event, arg) {
      log.info("test-eventA : callback -> hello from A : " + arg);
      return arg;
    },
    function(event, arg) {
      log.info("test-eventA : reply -> hello from A : " + arg);
      return arg;
    },
    true
  );

  let value = 1;
  function intervalFunc() {
    testEventA.dispatch(value);
    value++;
  }
  setInterval(intervalFunc, 10000);
}