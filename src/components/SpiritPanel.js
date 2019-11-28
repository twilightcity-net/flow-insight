import React, { Component } from "react";
import {
  Icon,
  Image,
  Menu,
  Popup,
  Progress,
  Segment,
  Transition
} from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";
import { SidePanelViewController } from "../perspective/SidePanelViewController";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";
import SpiritCanvas from "./SpiritCanvas";

export default class SpiritPanel extends Component {
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[SpiritPanel]";

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );

    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  /// performs a simple calculation for dynamic width of panel
  /// make height and width the same
  calculateSpiritWidth() {
    let spiritWidth = this.calculatePanelHeight() - 84;

    if (spiritWidth > 266) {
      spiritWidth = 266;
    }
    return spiritWidth;
  }

  /// performs a simple calculation for dynamic height of panel
  calculateSpiritHeight() {
    let spiritHeight = this.calculatePanelHeight() - 35;

    if (spiritHeight > 315) {
      spiritHeight = 315;
    }
    return spiritHeight;
  }

  openSpiritPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.SPIRIT,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        spiritVisible: true
      });
    }, this.state.animationDelay);
  }

  openBadgesPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BADGES,
      spiritVisible: false,
      badgesVisible: false
    });
    setTimeout(() => {
      this.setState({
        badgesVisible: true
      });
    }, this.state.animationDelay);
  }

  /// updates display to show spirit content
  handleSpiritClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  /// updates the display to show the badges content
  handleBadgesClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");

    this.myController.configureSpiritPanelListener(
      this,
      this.onRefreshActivePerspective
    );

    console.log(this.spiritCanvas);
  };

  onRefreshActivePerspective() {
    console.log(this.name + " - onRefreshActivePerspective!");

    let activeMenuItem = this.myController.activeSubmenuSelection;

    if (activeMenuItem === SidePanelViewController.SubmenuSelection.SPIRIT) {
      this.openSpiritPanel();
    } else {
      this.openBadgesPanel();
    }
  }

  componentWillReceiveProps = nextProps => {
    let flameRating = nextProps.flameRating;

    let flameString = "0";
    if (flameRating > 0) {
      flameString = "+" + flameRating;
    } else if (flameRating < 0) {
      flameString = flameRating;
    }

    this.setState({
      flameString: flameString
    });
  };

  handleClickForRage = () => {
    console.log(this.name + "Rage!");
    this.spiritModel.adjustFlame(-1);
  };

  handleClickForYay = () => {
    console.log(this.name + "Yay!");
    this.spiritModel.adjustFlame(+1);
  };

  componentWillUnmount() {
    console.log(this.name + " - componentWillUnmount");
    this.myController.configureSpiritPanelListener(this, null);
  }

  /// performs a simple calculation for dynamic height of panel
  calculatePanelHeight() {
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

  /// laods the stored state from parent or use default values
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.SPIRIT,
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

  handleClickForChainLink = () => {
    console.log(this.name + " - Link this Torchie!");
    this.spiritModel.linkThisTorchie(this.props.spiritId);
  };

  handleClickForChainUnlink = () => {
    console.log(this.name + " - Unlink!");

    this.spiritModel.unlink(this.props.spiritId);
  };

  isLinkedToMe = () => {
    let linkedToMe = false;
    if (this.hasActiveLinks()) {
      let spiritLink = null;
      for (var i in this.props.activeSpiritLinks) {
        spiritLink = this.props.activeSpiritLinks[i];

        if (spiritLink.friendSpiritId === this.props.me.id) {
          linkedToMe = true;
          break;
        }
      }
    }
    return linkedToMe;
  };

  hasActiveLinks = () => {
    return (
      this.props.activeSpiritLinks != null &&
      this.props.activeSpiritLinks.length > 0
    );
  };

  /// renders the console sidebar panel of the console view
  render() {
    const { activeItem } = this.state;

    let linkIcon = (
      <Popup
        trigger={
          <Icon
            link
            name="linkify"
            className="chainLink"
            onClick={this.handleClickForChainLink}
          />
        }
        content={<div className="tooltipPurple">Link this Torchie!</div>}
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let linksContent = "";

    if (this.hasActiveLinks()) {
      linksContent = this.props.activeSpiritLinks.map(d => (
        <div key={d.friendSpiritId}>{d.name}</div>
      ));

      linksContent = (
        <div>
          <div className="tooltipRed">Break Links</div>
          {linksContent}
        </div>
      );
    }

    let unlinkIcon = (
      <Popup
        trigger={
          <Icon
            link
            name="unlinkify"
            className="chainUnlink"
            onClick={this.handleClickForChainUnlink}
          />
        }
        content={linksContent}
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let busyLinkIcon = (
      <Popup
        trigger={<Icon link name="gg" className="chainLink" />}
        content={
          <div className="tooltipRed">
            Busy <i>(Already Linked)</i>
          </div>
        }
        inverted
        hideOnScroll
        position="bottom left"
      />
    );

    let activeLinkIcon = "";
    if (this.props.isMe) {
      if (this.hasActiveLinks()) {
        //there's at least one spirit link, so show the unlink icon
        activeLinkIcon = unlinkIcon;
      }
      //if my torchie isn't linked, don't show any icon
    } else {
      if (this.isLinkedToMe()) {
        activeLinkIcon = unlinkIcon;
      } else if (this.hasActiveLinks()) {
        activeLinkIcon = busyLinkIcon;
      } else {
        activeLinkIcon = linkIcon;
      }
    }

    const spiritContent = (
      <div className="spiritContent">
        <div className="spiritBackground">
          <div className="level">
            <b>{this.props.torchieOwner}'s Spirit</b>
            {activeLinkIcon}
          </div>

          <SpiritCanvas
            spirit={this.spiritModel}
            width={this.calculateSpiritWidth()}
            height={this.calculateSpiritHeight()}
          />

          <div className="level">
            <div className="infoTitle">Torchie {this.props.title}</div>
            <div className="infoLevel">Level {this.props.level}</div>
          </div>

          <Popup
            trigger={
              <Progress
                size="small"
                percent={this.props.percentXP}
                color="violet"
                inverted
                progress
              />
            }
            content={
              <div className="xpCount">
                Total XP: <i>{this.props.totalXP}</i>
              </div>
            }
            inverted
            hideOnScroll
            position="top left"
          />
        </div>
        <div className="ui two bottom attached buttons">
          <button
            className="ui icon button rageButton"
            tabIndex="0"
            onClick={this.handleClickForRage}
          >
            <Image centered src="./assets/images/wtf/24x24.png" />
          </button>
          <button
            className="ui icon button yayButton"
            tabIndex="1"
            onClick={this.handleClickForYay}
          >
            <Image centered src="./assets/images/yay/24x24.png" />
          </button>
        </div>
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
              name={SidePanelViewController.SubmenuSelection.SPIRIT}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.SPIRIT
              }
              onClick={this.handleSpiritClick}
            />
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.BADGES}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.BADGES
              }
              onClick={this.handleBadgesClick}
            />
          </Menu>
          <Segment inverted style={{ height: this.calculatePanelHeight() }}>
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
