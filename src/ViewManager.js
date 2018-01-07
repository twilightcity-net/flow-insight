import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import LoadingView from "./views/LoadingView";
import ConsoleView from "./views/ConsoleView";
import BugReportView from "./views/BugReportView";

//
// This class is used to manage the rendering of views in windows.
// There is a helper class ViewManagerHelper that is used to store
// the names of the views.
//
export default class ViewManager extends Component {
  /// When adding new views be sure to also update ViewManagerHelper
  /// with the name of the view you wish to reference from main process
  static get Views() {
    return {
      LOADING: <LoadingView />,
      CONSOLE: <ConsoleView />,
      BUGREPORT: <BugReportView />
    };
  }

  /// This method looks up the view from a query search string in the
  /// URL of the view that is loaded in the window. An exception is throw
  /// if  now view is found in the mapping
  static View(props) {
    let name = props.location.search.substr(1),
      view = ViewManager.Views[name.toUpperCase()];
    if (view == null) throw new Error("View '" + name + "' is undefined");
    return view;
  }

  /// returns the name of the current view from the window location url
  static get viewName() {
    let name = window.location.search.substr(1);
    return name;
  }

  /// update the class name of the wrapper with the view name.
  componentWillMount() {
    document.body.className = ViewManager.viewName;
  }

  /// this method creates a react routers and returns it to the DOM's
  /// bundled js. It will inject the correct view into the window
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
