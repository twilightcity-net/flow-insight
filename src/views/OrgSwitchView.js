import React, {Component} from "react";
import {Button, Dropdown, Grid, Icon, Input} from "semantic-ui-react";
import {RendererControllerFactory} from "../controllers/RendererControllerFactory";
import {DimensionController} from "../controllers/DimensionController";
import {HotkeyClient} from "../clients/HotkeyClient";
import {FervieClient} from "../clients/FervieClient";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 *  This view class is used to show a floating hotkey configuration window
 */
export default class OrgSwitchView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orgOptions: [],
      currentOrgOption: null,
      initialOrgOption: null,
      isOptionDirty: false
    }

    this.metaKeyOptions = [
      {key: "Control", value: "Control", text: "Ctrl"},
      {key: "Alt", value: "Alt", text: "Alt"},
      {key: "Command", value: "Command", text: "Cmd"}
    ];
  }

  componentDidMount() {
    FervieClient.init(this);

    FervieClient.getCurrentLoggedInCommunity(this, (arg) => {
      if (!arg.error) {
        const orgId = arg.data.orgId;

        FervieClient.getCommunityOptionsList(this, (arg) => {
          if (arg.data) {
            this.initializeOrgOptions(orgId, arg.data);

          } else {
            console.error(arg.error);
          }
        });
      } else {
        console.error(arg.error);
      }
    });
  }

  initializeOrgOptions(orgId, orgList) {
    const options = [];

    for (let org of orgList) {
      const option = {key: org.id, value: org.id, text: org.orgName};

      if (FeatureToggle.isFlowInsightApp() && (org.orgType === "COMPANY")) {
        options.push(option);
      } else if (FeatureToggle.isMoovieApp && org.orgType !== "COMPANY") {
        options.push(option);
      }
    }
    this.setState({
      orgOptions: options,
      currentOrgOption: orgId,
      initialOrgOption: orgId
    });
  }


  onClickClose = () => {
    console.log("close window!");
    let viewController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.ORG_SWITCHER,
        this
      );

    viewController.closeOrgSwitcherWindow();
  };

  onClickSwitch = () => {
    console.log("click switch!");

    if (this.state.currentOrgOption && this.state.isOptionDirty) {
      FervieClient.setPrimaryCommunity(this.state.currentOrgOption, this, (arg) => {
        console.log("primary community configured!");
        setTimeout(() => {
          FervieClient.restartApp(this, (arg) => {
            console.log("App restart called");
          });
        }, 333);
      });
    }

  }

  onClickCancel = () => {
    console.log("click cancel!");
    this.onClickClose();
  }


  /**
   * Whenever the metakey dropdown field was changed
   * @param e - the event that was generated by user gui event
   * @param value
   */
  handleChangeForSwitcher = (e, { value }) => {
    console.log(value);
    const isDirty = (value !== this.state.initialOrgOption);

    this.setState({
      currentOrgOption: value,
      isOptionDirty: isDirty
    })
  };

  getOrgSwitcherDropdown() {
    return (<Dropdown
      id={"orgSwitcherInput"}
      options={this.state.orgOptions}
      selection
      fluid
      value={this.state.currentOrgOption}
      onChange={this.handleChangeForSwitcher}
    />);
  }

  /// renders the view into our root element of our window
  render() {

    let height = DimensionController.getHeightFor(
      DimensionController.Components.HOTKEY_CONFIG
    );

    return (
      <div id="component" className="orgSwitchLayout">
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
          <div className="title">Switch Communities</div>

          {this.getOrgSwitcherDropdown()}

          <div className="buttons">
            <Button
              onClick={this.onClickCancel}
              size="medium"
              color="grey"
            >
              <Button.Content>Cancel</Button.Content>
            </Button>
            <Button
              disabled={!this.state.isOptionDirty}
              onClick={this.onClickSwitch}
              size="medium"
              color="violet"
            >
              <Button.Content>Switch</Button.Content>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
