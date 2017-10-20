  testEvents() {
    console.log("create update event");

    let updateEvent = new RendererEvent(
      EventManagerHelper.EventTypes.TEST_EVENT,
      this,
      function(event, arg) {
        console.log(
          "[Renderer] test-eventD : callback -> hello from D : " + arg
        );
        return arg;
      },
      function(event, arg) {
        console.log("[Renderer] test-eventD : reply -> hello from D : " + arg);
        return arg;
      }
    );

    updateEvent.dispatch(2);
  }