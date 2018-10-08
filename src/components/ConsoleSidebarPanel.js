import React, { Component } from "react";
import { Image, Menu, Progress, Segment, Transition } from "semantic-ui-react";
import {DataStoreFactory} from "../DataStoreFactory";
import {RendererEventFactory} from "../RendererEventFactory";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleSidebarPanel extends Component {
  constructor(props) {
    super(props);
    this.state = this.loadState();

  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  /// laods the stored state from parent or use default values
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: "spirit",
        spiritVisible: true,
        badgesVisible: false,
        animationType: "fly down",
        animationDelay: 350,
        level: 0,
        percentXP: 99,
        totalXP: 99999,
        title: ""
      };
    }
    return state;
  }

  /// stores this components state in the parents state
  saveState(state) {
    this.props.saveStateCb(state);
  }

  componentDidMount = () => {
    this.log("ConsoleSidebarPanel : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.XP_SUMMARY,
      this
    );

    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });


  };

  refreshXP = (event, arg) => {
    this.log("ConsoleSidebarPanel : refreshXP");
    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };

  onStoreLoadCb = (err) => {
    this.log("ConsoleSidebarPanel : onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let xpSummaryDto = this.store.dto;

      this.setState({
        level: xpSummaryDto.level,
        percentXP: Math.round((xpSummaryDto.xpProgress / xpSummaryDto.xpRequiredToLevel) * 100),
        totalXP: xpSummaryDto.totalXP,
        title: xpSummaryDto.title
      });


      this.log("Success!");
    }
  };

    /// performs a simple calculation for dynamic height of panel
  calculateMenuHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 8,
      contentHeader: 34,
      bottomMenuHeight: 28
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader -
      heights.bottomMenuHeight
    );
  }

  /// updates display to show spirit content
  handleSpiritClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        spiritVisible: true
      });
    }, this.state.animationDelay);
  };

  /// updates the display to show the badges content
  handleBadgesClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        badgesVisible: true
      });
    }, this.state.animationDelay);
  };

  /// make sure we are saving the state when hiding component
  componentWillUnmount() {
    this.saveState(this.state);
  }

  /// renders the console sidebar panel of the console view
  render() {
    const { activeItem } = this.state;
    const spiritContent = (
      <div className="spiritContent">
        <Image centered src="./assets/images/spirit.png" />
        <div className="level">
          <b>Level {this.state.level} </b>
        </div>
        <div className="level">
          <i>Torchie {this.state.title} </i>
        </div>
        <Progress size="small" percent={this.state.percentXP} color="violet" inverted progress>
          {this.state.totalXP} XP
        </Progress>
      </div>
    );
    const badgesContent = (
      <div className="badgesContent">No Badges Earned :(</div>
    );
    return (
      <div
        id="component"
        className="consoleSidebarPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name="spirit"
              active={activeItem === "spirit"}
              onClick={this.handleSpiritClick}
            />
            <Menu.Item
              name="badges"
              active={activeItem === "badges"}
              onClick={this.handleBadgesClick}
            />
          </Menu>
          <Segment inverted style={{ height: this.calculateMenuHeight() }}>
            <Transition
              visible={this.state.spiritVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {spiritContent}
            </Transition>
            <Transition
              visible={this.state.badgesVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {badgesContent}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
