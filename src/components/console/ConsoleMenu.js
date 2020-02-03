import React, { Component } from "react";
import { Divider, Icon, Menu, Popup } from "semantic-ui-react";
import { MainPanelViewController } from "../../controllers/MainPanelViewController";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { BrowserRequestFactory } from "../../controllers/BrowserRequestFactory";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleMenu extends Component {
  constructor(props) {
    super(props);
    this.name = "[ConsoleMenu]";
    this.isChanging = false;
    this.animationTime = props.animationTime + 50;
    this.state = {
      activeItem: MainPanelViewController.Components.DEFAULT,
      isOnline: true,
      pingTime: 0,
      server: "identifying...",
      errorMsg: ""
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.MAIN_PANEL,
      this
    );
  }

  componentDidMount = () => {
    this.myController.configurePulseListener(this, this.onPulse);
    this.myController.configureHeartbeatListener(this, this.onHeartbeat);
    // this.myController.configureMenuListener(
    //   this,
    //   this.onRefreshActivePerspective
    // );
  };

  componentWillUnmount = () => {
    // this.myController.configureMenuListener(this, null);
    this.myController.configureHeartbeatListener(this, null);
    this.myController.configurePulseListener(this, null);
  };

  // onRefreshActivePerspective = () => {
  //   let activeMenuItem = this.myController.activeMenuSelection;
  //   console.log(activeMenuItem);
  //   console.log(this.name + " refresh active perspective changed: " + activeMenuItem);
  //   this.setState({ activeItem: activeMenuItem });
  // };

  onHeartbeat(event, arg) {
    this.setState({
      isOnline: arg.isOnline,
      pingTime: arg.pingTime,
      latencyTime: arg.latencyTime,
      talkUrl: arg.talkUrl,
      server: arg.server,
      errorMsg: arg.message
    });
  }

  onPulse(event, arg) {
    this.setState({
      latencyTime: arg.latencyTime
    });
  }

  handleMenuClick = (e, { name }) => {
    console.log(this.name + " make browser request -> " + name);
    let request = null;
    switch (name) {
      case MainPanelViewController.Components.JOURNAL:
        request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.JOURNAL,
          BrowserRequestFactory.Locations.ME
        );
        break;
      case MainPanelViewController.Components.TROUBLESHOOT:
        request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.TROUBLESHOOT
        );
        break;
      case MainPanelViewController.Components.FLOW:
        request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.FLOW,
          BrowserRequestFactory.Locations.ME
        );
        break;
      default:
        throw new Error(`Unknown console menu type '${name}'`);
    }
    this.myController.makeConsoleBrowserRequest(request);
    // if (this.isChanging || this.state.activeItem === name) return;
    // this.isChanging = true;
    //
    // this.myController.changeActivePanel(this.state.activeItem, name);
    //
    // setTimeout(() => {
    //   this.isChanging = false;
    // }, this.animationTime);
  };

  handleHideClick = () => {
    this.myController.hideConsoleWindow();
  };

  render() {
    const {
      activeItem,
      isOnline,
      pingTime,
      latencyTime,
      talkUrl,
      server,
      errorMsg
    } = this.state;
    const networkConnectMenuItem = (
      <Menu.Item
        header
        className={isOnline ? "networkConnect" : "networkConnectError"}
      >
        <Icon
          name={isOnline ? "signal" : "remove circle"}
          color={isOnline ? "green" : "red"}
        />
      </Menu.Item>
    );
    const popupContent = (
      <div>
        <div>
          <i>{server}</i>
        </div>
        <div>
          <i>ping: </i>
          <b>
            <i>{pingTime <= 0 ? "calculating..." : pingTime + "ms"}</i>
          </b>
        </div>
        <Divider />
        <div>
          <i>{talkUrl}</i>
        </div>
        <div>
          <i>latency: </i>
          <b>
            <i>{latencyTime <= 0 ? "calculating..." : latencyTime + "ms"}</i>
          </b>
        </div>
        {!isOnline && (
          <div className="errorMsg">
            <i style={{ color: "red" }}>
              <b>{errorMsg}</b>
            </i>
          </div>
        )}
      </div>
    );
    return (
      <div id="component" className="consoleMenu">
        <Menu size="tiny" inverted>
          <Popup
            trigger={networkConnectMenuItem}
            className="chunkTitle"
            content={popupContent}
            position="top left"
            offset={-2}
            inverted
          />
          <Menu.Item
            name={MainPanelViewController.Components.JOURNAL}
            color="violet"
            active={activeItem === MainPanelViewController.Components.JOURNAL}
            onClick={this.handleMenuClick}
          >
            <Icon name="book" size="large" />
            Journal
          </Menu.Item>
          <Menu.Item
            name={MainPanelViewController.Components.TROUBLESHOOT}
            color="violet"
            active={
              activeItem === MainPanelViewController.Components.TROUBLESHOOT
            }
            onClick={this.handleMenuClick}
          >
            <Icon name="lightning" size="large" />
            Troubleshoot
          </Menu.Item>
          <Menu.Item
            name={MainPanelViewController.Components.FLOW}
            color="violet"
            active={activeItem === MainPanelViewController.Components.FLOW}
            onClick={this.handleMenuClick}
          >
            <Icon name="random" size="large" />
            Flow
          </Menu.Item>
          {/*<Menu.Menu position="right">*/}
          {/*  <Menu.Item name="hide" onClick={this.handleHideClick}>*/}
          {/*    <Icon name="toggle up" size="large" />*/}
          {/*  </Menu.Item>*/}
          {/*</Menu.Menu>*/}
        </Menu>
      </div>
    );
  }
}
