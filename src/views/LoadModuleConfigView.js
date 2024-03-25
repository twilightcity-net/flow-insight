import React, {Component} from "react";
import {Button, Icon} from "semantic-ui-react";
import {RendererControllerFactory} from "../controllers/RendererControllerFactory";
import {DimensionController} from "../controllers/DimensionController";
import {CodeClient} from "../clients/CodeClient";

/**
 *  This view class is used to show a small load module config window
 */
export default class LoadModuleConfigView extends Component {
  constructor(props) {
    super(props);

    console.log(this.props.routeProps.moduleNames);
    const moduleNames = this.splitByPipes(this.props.routeProps.moduleNames);
    const configFiles = this.splitByPipes(this.props.routeProps.configFiles);

    this.state = {
      currentModuleIndex: 0,
      currentModuleName: moduleNames[0],
      currentConfigFile: configFiles[0],
      moduleNames: moduleNames,
      configFiles: configFiles,
      errorText: ""
    }
  }

  componentDidMount() {
    this.loadInProgress = false;

    CodeClient.init(this);
  }

  splitByPipes(moduleNameStr) {
    let ids = moduleNameStr.split("|");
    for (let i = 0; i < ids.length; i++) {
      console.log("id = "+ids[i]);
    }
    return ids;
  }

  onClickLoad = () => {
    console.log("loading config!");

    if (this.loadInProgress) return;

    this.loadInProgress = true;

    CodeClient.updateCodeModuleConfig(this.state.currentModuleName, this.state.currentConfigFile, (arg) => {
      this.loadInProgress = false;
      if (!arg.error) {
        this.forwardToNextModule();
      } else {
        console.error("Unable to load module", arg.error);
        this.setState({errorText: "Unable to load: "+arg.error})
      }
    });

  }


  forwardToNextModule() {
    let currentModuleIndex = this.state.currentModuleIndex + 1;
    if (currentModuleIndex < this.state.moduleNames.length) {
      this.setState({
        currentModuleIndex: currentModuleIndex,
        currentModuleName: this.state.moduleNames[currentModuleIndex],
        currentConfigFile: this.state.configFiles[currentModuleIndex],
        errorText: ""
      });
    } else {
      this.onClickClose();
    }
  }

  onClickClose = () => {
    console.log("close window!");
    let moduleConfigController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.MODULE_DIALOG,
        this
      );

    moduleConfigController.closeModuleConfigWindow();
  }

  /// renders the view into our root element of our window
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.MODULE_CONFIG_DIALOG
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
          <div className="title">Configure Code Module ({this.state.currentModuleIndex + 1} of {this.state.moduleNames.length})</div>

          <div className="registerText">
            Found configuration file for <span className="pluginId">
            {this.state.currentModuleName}</span>.
             Would you like to load this configuration now?
          </div>

          <div className="errorText">
            {this.state.errorText}
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
              onClick={this.onClickLoad}
            >
              <Button.Content>Load Configuration</Button.Content>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
