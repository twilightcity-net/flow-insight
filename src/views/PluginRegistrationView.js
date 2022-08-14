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

    console.log(this.props.routeProps.pluginIds);
    let pluginIds = this.parsePluginIds(this.props.routeProps.pluginIds);

    this.state = {
      currentPluginIndex: 0,
      currentPluginId: pluginIds[0],
      pluginIds: pluginIds
    }
  }

  parsePluginIds(pluginIdStr) {
    let ids = pluginIdStr.split("|");
    for (let i = 0; i < ids.length; i++) {
      console.log("id = "+ids[i]);
    }
    return ids;
  }

  componentDidMount() {

  }

  onClickRegister = () => {
    console.log("register!");
  }

  onClickClose = () => {
    console.log("close window!");
    let pluginConfigController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.PLUGIN_DIALOG,
        this
      );

    pluginConfigController.closePluginWindow();
  }

  /// renders the view into our root element of our window
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.PLUGIN_DIALOG
    );

    return (
      <div id="component" className="pluginLayout">
        <div className="closeIcon">
          <Icon
            name="close"
            size="large"
            onClick={this.onClickClose}
          />
        </div>
        <div className="configBox"
             style={{
               height: height,
             }}>
          <div className="title">Unregistered Plugin</div>

          <div className="registerText">
            Found plugin <span className="pluginId">
            {this.state.currentPluginId}</span>.
             Would you like to register this plugin now?
          </div>

          <div className="buttons">
            <Button
              size="medium"
              color="grey"
              onClick={this.onClickClose}
            >
              <Button.Content>Cancel</Button.Content>
            </Button>
            <Button
              size="medium"
              color="violet"
              onClick={this.onClickRegister}
            >
              <Button.Content>Register</Button.Content>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
