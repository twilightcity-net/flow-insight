import React, {Component} from "react";
import {Button, Dropdown, Grid, Icon, Input} from "semantic-ui-react";
import {RendererControllerFactory} from "../controllers/RendererControllerFactory";
import {DimensionController} from "../controllers/DimensionController";
import {HotkeyClient} from "../clients/HotkeyClient";

/**
 *  This view class is used to show a small plugin registration window
 */
export default class PluginRegistrationView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  componentDidMount() {
  }


  /// renders the view into our root element of our window
  render() {
    return (
      <div id="component" className="pluginLayout">
        <div className="closeIcon">
          <Icon
            name="close"
            size="large"
            onClick={this.onClickClose}
          />
        </div>
      </div>
    );
  }
}
