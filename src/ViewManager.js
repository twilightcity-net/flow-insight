import React, { Component } from "react";
import queryString from "query-string";
import { BrowserRouter as Router, Route } from "react-router-dom";
import LoadingView from "./views/LoadingView";
import ActivatorView from "./views/ActivatorView";
import ConsoleView from "./views/ConsoleView";
import BugReportView from "./views/BugReportView";

/**
 * This class is used to manage the rendering of views in windows. There is a
 * helper class ViewManagerHelper that is used to store the names of the views.
 */
export default class ViewManager extends Component {
  /**
   * When adding new views be sure to also update ViewManagerHelper with the name
   * of the view you wish to reference from main process
   * @returns {{LOADING: *, ACTIVATOR: *, CONSOLE: *, BUGREPORT: *}}
   * @constructor
   */
  static get Views() {
    return {
      LOADING: <LoadingView />,
      ACTIVATOR: <ActivatorView />,
      CONSOLE: <ConsoleView />,
      BUGREPORT: <BugReportView />
    };
  }

  /**
   * this is a static get function that returns the view name dynamically based
   * on the value that the windows manager pass from the main process
   * @returns {*} - the name of the view based on the window url location query
   */
  static get viewName() {
    let query = queryString.parse(window.location.search);
    let name = query.view;
    return name;
  }

  /**
   * if  now view is found in the mapping
   * @param props - the props to pass into the view
   * @constructor - returns the classes constructor function to render dynamically
   */
  static View(props) {
    let query = queryString.parse(window.location.search),
      name = query.view,
      view = ViewManager.Views[name.toUpperCase()];
    if (view == null) throw new Error("View '" + name + "' is undefined");
    return view;
  }

  /**
   *  update the class name of the wrapper with the view name. This also will
   *  store there render3d flag for various components that might need to know
   */
  componentWillMount() {
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
