import React, {Component} from "react";
import {Button, Icon} from "semantic-ui-react";
import {RendererControllerFactory} from "../controllers/RendererControllerFactory";
import {DimensionController} from "../controllers/DimensionController";
import {AccountClient} from "../clients/AccountClient";

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
    this.registerInProgress = false;

    AccountClient.init(this);
  }

  onClickRegister = () => {
    console.log("register!");

    if (this.registerInProgress) return;

    this.registerInProgress = true;

    AccountClient.registerPlugin(this.state.currentPluginId, this, (arg) => {
      this.registerInProgress = false;
      if (!arg.error) {
        this.forwardToNextPlugin();
      } else {
        console.error("Unable to register plugin", arg.error);
      }
    });
  }

  forwardToNextPlugin() {
    let currentPluginIndex = this.state.currentPluginIndex + 1;
    if (currentPluginIndex < this.state.pluginIds.length) {
      this.setState({
        currentPluginIndex: currentPluginIndex,
        currentPluginId: this.state.pluginIds[currentPluginIndex],
      });
    } else {
      this.onClickClose();
    }
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
          <div className="title">Unregistered Plugin ({this.state.currentPluginIndex + 1} of {this.state.pluginIds.length})</div>

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
