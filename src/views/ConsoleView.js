import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";

/*
 * This View will contain logic to inject the various tabs of the
 * console into the view. It will also manage the states of these
 * views in an array.
 *
 * TODO: implement console view
 */

export default class ConsoleView extends Component {
  constructor(props) {
    super(props);

    console.log("[ConsoleView] create events");
    this.events = {
      load: new RendererEvent(
        RendererEventManagerHelper.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        function(event, arg) {
          console.log(
            "[ConsoleView] event -> WINDOW_CONSOLE_SHOW_HIDE : " + arg
          );
        }
      )
    };
  }

  render() {
    return <h1>View.Console.render()</h1>;
  }
}
