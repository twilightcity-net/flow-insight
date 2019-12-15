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
import { DimensionController } from "../perspective/DimensionController";

/**
 * this class is responsible for storing the users avatar, soul, inventory,
 * and accessories. Currently this only uses a simple canvas but will use
 * an embedded unity3d instance
 */
export default class SpiritPanel extends Component {
  /**
   * the constructor function which is used to build the spirit panel
   * @param props - these are the components properties
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[SpiritPanel]";
    this.render3d = false;

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );

    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  /**
   * thew function that is called to open and display the badges panel in the side
   */
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

  /**
   * the function that is called to open and display the badges panel in the side
   */
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

  /**
   * updates display to show spirit content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleSpiritClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  /**
   * updates the display to show the badges content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleBadgesClick = (e, { name }) => {
    this.myController.changeActiveSubmenuPanel(name);
  };

  /**
   * called after the component mounds and then notifies the perspective
   * controller to refresh the view
   */
  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");

    this.myController.configureSpiritPanelListener(
      this,
      this.onRefreshActivePerspective
    );
  };

  /**
   * event listener that is notified when the perspective changes views
   */
  onRefreshActivePerspective() {
    console.log(this.name + " - onRefreshActivePerspective!");

    let activeMenuItem = this.myController.activeSubmenuSelection;

    if (activeMenuItem === SidePanelViewController.SubmenuSelection.SPIRIT) {
      this.openSpiritPanel();
    } else {
      this.openBadgesPanel();
    }
  }

  /**
   * called right before the component gets passed its properties
   * @param nextProps - the next propertiers to change from the previous
   */
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

  /**
   * handles the rage button press
   */
  handleClickForRage = () => {
    console.log(this.name + "Rage!");
    this.spiritModel.adjustFlame(-1);
  };

  /**
   * handles the yay button press
   */
  handleClickForYay = () => {
    console.log(this.name + "Yay!");
    this.spiritModel.adjustFlame(+1);
  };

  /**
   * called right before the component will mount. This will clear the listeners callback
   */
  componentWillUnmount() {
    console.log(this.name + " - componentWillUnmount");
    this.myController.configureSpiritPanelListener(this, null);
  }

  /**
   * laods the stored state from parent or use default values
   * @returns {{totalXP: number, animationDelay: number, level: number, activeItem: string, badgesVisible: boolean, spiritVisible: boolean, title: string, percentXP: number, animationType: string}|*}
   */
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

  /**
   * handles clicking to link a spirit
   */
  handleClickForChainLink = () => {
    console.log(this.name + " - Link this Torchie!");
    this.spiritModel.linkThisTorchie(this.props.spiritId);
  };

  /**
   * handles user spirit unlinking
   */
  handleClickForChainUnlink = () => {
    console.log(this.name + " - Unlink!");

    this.spiritModel.unlink(this.props.spiritId);
  };

  /**
   * checks to see if the spirit is linked to us
   * @returns {boolean}
   */
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

  /**
   * checks to see if the Spirit has active links or not
   * @returns {boolean|boolean}
   */
  hasActiveLinks = () => {
    return (
      this.props.activeSpiritLinks != null &&
      this.props.activeSpiritLinks.length > 0
    );
  };

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
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
        position="top left"
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
      <div className="spiritContent" style={{ height: this.props.height - 64 }}>
        <div className="spiritBackground">
          <div className="level" align={"left"}>
            <b></b>
            {activeLinkIcon}
          </div>

          <div className="level">
            <div className="infoTitle">
              {this.props.torchieOwner} <i>({this.props.title})</i>
            </div>
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
            position="bottom right"
          />
        </div>

        <SpiritCanvas
          flameString={this.state.flameString}
          spirit={this.spiritModel}
          width={DimensionController.getSpiritCanvasWidth()}
          height={DimensionController.getSpiritCanvasHeight()}
          render3d={this.render3d}
        />

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
          width: "100%",
          height: this.props.height,
          opacity: 1
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted secondary>
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.SPIRIT}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.SPIRIT
              }
              onClick={this.handleSpiritClick}
              color={"violet"}
            />
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.BADGES}
              active={
                activeItem === SidePanelViewController.SubmenuSelection.BADGES
              }
              onClick={this.handleBadgesClick}
              color={"violet"}
            />
          </Menu>
          <Segment inverted className={"spiritContentWrapper"}>
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
