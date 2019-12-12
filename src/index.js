import React from "react";
import ReactDOM from "react-dom";
import ViewManager from "./ViewManager";
import "semantic-ui-css/semantic.min.css";

/**
 * the root of the render view. This is used to route window content to the
 * associated views
 */
ReactDOM.render(<ViewManager />, document.getElementById("root"));
