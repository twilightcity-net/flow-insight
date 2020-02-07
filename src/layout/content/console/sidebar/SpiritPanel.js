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
import { DataModelFactory } from "../../../../models/DataModelFactory";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { ActiveViewControllerFactory } from "../../../../controllers/ActiveViewControllerFactory";
import SpiritCanvas from "./SpiritCanvas";
import { DimensionController } from "../../../../controllers/DimensionController";

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
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  /**
   * thew function that is called to open and display the badges panel in the side
   */
  showSpiritPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.SPIRIT,
      spiritVisible: true,
      badgesVisible: false
    });
  }

  /**
   * the function that is called to open and display the badges panel in the side
   */
  showBadgesPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BADGES,
      spiritVisible: false,
      badgesVisible: true
    });
  }

  /**
   * updates display to show spirit content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleSpiritClick = (e, { name }) => {
    this.myController.changeActiveSpiritSubmenuPanel(name);
  };

  /**
   * updates the display to show the badges content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleBadgesClick = (e, { name }) => {
    this.myController.changeActiveSpiritSubmenuPanel(name);
  };

  /**
   * called after the component mounds and then notifies the perspective
   * controller to refresh the view
   */
  componentDidMount = () => {
    this.myController.configureSpiritPanelListener(
      this,
      this.onRefreshSpiritPanel
    );
    this.onRefreshSpiritPanel();
  };

  /**
   * event listener that is notified when the perspective changes views
   */
  onRefreshSpiritPanel() {
    switch (this.myController.activeSpiritSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.SPIRIT:
        this.showSpiritPanel();
        break;
      case SidePanelViewController.SubmenuSelection.BADGES:
        this.showBadgesPanel();
        break;
      default:
        throw new Error(
          "Unknown spirit panel type '" +
            this.myController.activeSpiritSubmenuSelection +
            "'"
        );
    }
  }

  /**
   * called right before the component gets passed its properties
   * @param nextProps - the next propertiers to change from the previous
   */
  componentWillReceiveProps = nextProps => {
    let flameString = this.getFlameString(nextProps.flameRating);
    this.setState({
      flameString: flameString
    });
  };

  /**
   * gets the string to render in the column for the flame intensity
   * @param rating
   * @returns {string}
   */
  getFlameString(rating) {
    let str = "0";
    if (rating > 0) {
      str = "+" + rating;
    } else if (rating < 0) {
      str = rating;
    }
    return str;
  }

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
        spiritVisible: false,
        badgesVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
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
   * gets the basic link icon to link to other users
   * @returns {*}
   */
  getLinkIcon = () => {
    return (
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
  };

  /**
   * gets the body of the link content for the tooltip
   * @returns {string}
   */
  getLinksContent = () => {
    let links = "";
    if (this.hasActiveLinks()) {
      links = this.props.activeSpiritLinks.map(d => (
        <div key={d.friendSpiritId}>{d.name}</div>
      ));
      links = (
        <div>
          <div className="tooltipRed">Break Links</div>
          {links}
        </div>
      );
    }
    return links;
  };

  /**
   * gets the unlink icon for breaking links to other users
   * @returns {*}
   */
  getUnlinkIcon = () => {
    return (
      <Popup
        trigger={
          <Icon
            link
            name="unlinkify"
            className="chainUnlink"
            onClick={this.handleClickForChainUnlink}
          />
        }
        content={this.getLinksContent()}
        inverted
        hideOnScroll
        position="bottom left"
      />
    );
  };

  /**
   * gets the busy icon for user linking
   * @returns {*}
   */
  getBusyIcon = () => {
    return (
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
  };

  /**
   * gets the badges content panel for the sidebar
   * @returns {*}
   */
  getBadgesContent = () => {
    return (
      <div className="badgesContent" style={{ height: this.props.height - 61 }}>
        <i>Check back later :)</i>
      </div>
    );
  };

  /**
   * renders the spirit title content for the panel
   * @returns {*}
   */
  getSpiritTitle = () => {
    let linkIcon = this.getLinkIcon(),
      unlinkIcon = this.getUnlinkIcon(),
      busyLinkIcon = this.getBusyIcon(),
      activeLinkIcon = "";

    if (this.props.isMe) {
      if (this.hasActiveLinks()) {
        activeLinkIcon = unlinkIcon;
      }
    } else {
      if (this.isLinkedToMe()) {
        activeLinkIcon = unlinkIcon;
      } else if (this.hasActiveLinks()) {
        activeLinkIcon = busyLinkIcon;
      } else {
        activeLinkIcon = linkIcon;
      }
    }
    return (
      <div className="spiritTitle">
        <div className="level">
          <div className="infoTitle">
            <b>{this.props.torchieOwner}</b>
            {activeLinkIcon}
          </div>
          <div className="infoLevel">
            <b>Level {this.props.level} </b>
            <br />
            <i>({this.props.title})</i>
          </div>
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
    );
  };

  /**
   * gets a 2d canvas to draw our torchie on
   * @returns {*}
   */
  getSpiritCanvas = () => {
    return (
      <SpiritCanvas
        flameString={this.state.flameString}
        spirit={this.spiritModel}
        width={DimensionController.getSpiritCanvasWidth()}
        height={DimensionController.getSpiritCanvasHeight()}
        render3d={this.render3d}
      />
    );
  };

  /**
   * renders the flame buttons below the canvas
   * @returns {*}
   */
  getSpiritButtons = () => {
    return (
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
    );
  };

  /**
   * renders the parts of the component together
   * @returns {*}
   */
  getSpiritContent = () => {
    return (
      <div className="spiritContent">
        {this.getSpiritTitle()}
        {this.getSpiritCanvas()}
        {this.getSpiritButtons()}
      </div>
    );
  };

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

    const spiritContent = this.getSpiritContent();
    const badgesContent = this.getBadgesContent();
    return (
      <div
        id="component"
        className="consoleSidebarPanel spiritPanel"
        style={{
          width: "100%",
          height: this.props.height,
          opacity: 1
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
