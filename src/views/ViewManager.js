import React, { Component } from "react";
import queryString from "query-string";
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import LoadingView from "./LoadingView";
import ActivatorView from "./ActivatorView";
import ConsoleView from "./ConsoleView";
import ChartView from "./ChartView";
import HotkeyView from "./HotkeyView";
import MoovieView from "./MoovieView";
import MessageView from "./MessageView";

/**
 * This class is used to manage the rendering of views in windows. There is a
 * helper class ViewManagerHelper that is used to store the names of the views.
 */
export default class ViewManager extends Component {

  /**
   * this is a static get function that returns the view name dynamically based
   * on the value that the windows manager pass from the main process
   * @returns {*} - the name of the view based on the window url location query
   */
  static get viewName() {
    let query = queryString.parse(window.location.search);
    return query.view;
  }

  static getViewProps(query) {
    let props = {};
    for (let key in query) {
      if (key !== "view" && key !== "render3d") {
        props[key] = query[key];
      }
    }

    return props;
  }

  static getViewWithProps(viewName, props) {
    let viewNameUpper = viewName.toUpperCase();

    if (viewNameUpper === "LOADING") {
      return <LoadingView routeProps={props} />;
    } else if (viewNameUpper === "ACTIVATOR") {
      return <ActivatorView routeProps={props} />;
    } else if (viewNameUpper === "CONSOLE") {
      return <ConsoleView routeProps={props} />;
    } else if (viewNameUpper === "CHART") {
      return <ChartView routeProps={props} />;
    } else if (viewNameUpper === "HOTKEY") {
      return <HotkeyView routeProps={props}/>;
    } else if (viewNameUpper === "MOOVIE") {
        return <MoovieView routeProps={props} />;
    } else if (viewNameUpper === "MESSAGE") {
      return <MessageView routeProps={props} />;
    } else {
      throw new Error(
        "Unable to render unknown view type " +
          viewNameUpper
      );
    }
  }

  /**
   * Returns a view component constructed with props passed in from the url arguments
   * @constructor - returns the classes constructor function to render dynamically
   */
  static View() {
    let query = queryString.parse(window.location.search),
      name = query.view,
      props = ViewManager.getViewProps(query);
    return ViewManager.getViewWithProps(name, props);
  }

  /**
   *  update the class name of the wrapper with the view name. This also will
   *  store there render3d flag for various components that might need to know
   */

  componentDidMount() {
    let query = queryString.parse(window.location.search);
    ViewManager.render3d = query.render3d;
    document.body.className = ViewManager.viewName;
  }

  /**
   * this method creates a react routers and returns it to the DOM's bundled js.
   * It will inject the correct view into the window
   * @returns {*} -= the root JSX to render in the 'root' DOM element of the window
   */
  render() {
    return (
      <Router>
        <div id="view" className={ViewManager.viewName}>
          <Route path="/" component={ViewManager.View} />
        </div>
      </Router>
    );
  }
}
