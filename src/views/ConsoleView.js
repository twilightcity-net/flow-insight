import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import ConsoleTabs from "../components/ConsoleTabs";

/*
 * This View will contain logic to inject the various tabs of the
 * console into the view. It will also manage the states of these
 * views in an array.
 */
export default class ConsoleView extends Component {
  /*
	 * sets up the event to listen for if the window is shown or hiden. Activates
	 * animation according
	 */
  constructor(props) {
    super(props);
    this.events = {
      load: new RendererEvent(
        RendererEventManagerHelper.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        function(event, arg) {
          console.log(
            "[ConsoleView] event -> WINDOW_CONSOLE_SHOW_HIDE : " + arg
          );
          let root = document.getElementById("root");
          if (arg === 0) {
            this.scope.setTransparency(root, 0);
            this.scope.animateShow(root, 20, 14, 0);
          } else {
            this.scope.setTransparency(root, 0.9);
            this.scope.animateHide(root, 20, 14, 0.9);
          }
        }
      )
    };
  }

  /* 
   * animates the window being shown
   * @param {dom} the dom element that is the root of the document
   * @param {integer} the amount to increment the animation by
   * @param {integer} the amount of time to step the animation by
   * @param {float} a float value of the current opacity. (circular ref.)
   */
  animateShow(root, i, t, o) {
    setTimeout(() => {
      if (o > 0 && o < 0.16) {
        o = Math.round((o + i * 0.001) * 100) / 100;
      } else if (o >= 0.16 && o < 0.5) {
        o = Math.round((o + i * 0.002) * 100) / 100;
      } else {
        o = Math.round((o + i * 0.004) * 100) / 100;
      }
      this.setTransparency(root, o);
      if (o < 0.9) {
        this.animateShow(root, i, t, o);
      } else {
        this.setTransparency(root, 0.9);
      }
    }, t);
  }

  /* 
   * animates the window being hidden
   * @param {dom} the dom element that is the root of the document
   * @param {integer} the amount to increment the animation by
   * @param {integer} the amount of time to step the animation by
   * @param {float} a float value of the current opacity. (circular ref.)
   */
  animateHide(root, i, t, o) {
    setTimeout(() => {
      if (o > 0.6 && o < 0.9) {
        o = Math.round((o - i * 0.001) * 100) / 100;
      } else if (o > 0.44 && o <= 0.6) {
        o = Math.round((o - i * 0.002) * 100) / 100;
      } else {
        o = Math.round((o - i * 0.004) * 100) / 100;
      }
      this.setTransparency(root, o);
      if (o > 0) {
        this.animateHide(root, i, t, o);
      } else {
        this.setTransparency(root, 0);
      }
    }, t);
  }

  /*
   * sets the transparency of a dom object
   * @param {dom} the dom object to apply this to
   * @param {value} the amount to set the trans. to
   */
  setTransparency(obj, value) {
    obj.style.background = "rgba(255, 255, 255, " + value + ")";
    obj.style.opacity = value + "";
  }

  /*
   * renders the component in the view
   */
  render() {
    return <ConsoleTabs/>;
  }
}
