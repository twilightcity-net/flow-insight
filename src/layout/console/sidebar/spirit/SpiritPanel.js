import React, { Component } from "react";
import {
  Menu,
  Popup,
  Progress,
  Segment,
  Transition
} from "semantic-ui-react";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import SpiritCanvas from "./SpiritCanvas";
import { DimensionController } from "../../../../controllers/DimensionController";
import { TeamClient } from "../../../../clients/TeamClient";
import UtilRenderer from "../../../../UtilRenderer";

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
    this.name = "[SpiritPanel]";
    this.render3d = false;
    this.animationType =
      SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay =
      SidePanelViewController.AnimationDelays.SUBMENU;
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.state = {
      activeItem:
        SidePanelViewController.SubmenuSelection.SPIRIT,
      spiritVisible: false,
      badgesVisible: false
    };
    this.me = TeamClient.getMe();
  }

  /**
   * thew function that is called to open and display the badges panel in the side
   */
  showSpiritPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.SPIRIT,
      spiritVisible: true,
      badgesVisible: false
    });
  }

  /**
   * the function that is called to open and display the badges panel in the side
   */
  showBadgesPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.BADGES,
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
    this.me = TeamClient.getMe();
    switch (
      this.myController.activeSpiritSubmenuSelection
    ) {
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
   * called right before the component will mount. This will clear the listeners callback
   */
  componentWillUnmount() {
    this.myController.configureSpiritPanelListener(
      this,
      null
    );
  }

  /**
   * gets the badges content panel for the sidebar
   * @returns {*}
   */
  getBadgesContent = () => {
    return (
      <div
        className="badgesContent"
        style={{
          height:
            DimensionController.getConsoleLayoutHeight() -
            61
        }}
      >
        <i>Check back later :)</i>
      </div>
    );
  };

  /**
   * renders the spirit title content for the panel
   * @returns {*}
   */
  getSpiritTitle = () => {
    let displayName = this.me.displayName,
      xpSummary = this.me.xpSummary,
      xpPercent = UtilRenderer.getXpPercent(
        xpSummary.xpProgress,
        xpSummary.xpRequiredToLevel
      );

    return (
      <div className="spiritTitle">
        <div className="level">
          <div className="infoTitle">
            <b>{displayName}</b>
          </div>
          <div className="infoLevel">
            <b>Level {xpSummary.level} </b>
            <br />
            <i>({xpSummary.title})</i>
          </div>
        </div>

        <Popup
          trigger={
            <Progress
              size="small"
              percent={xpPercent}
              color="violet"
              inverted
              progress
            />
          }
          content={
            <div className="xpCount">
              <b>
                <i>Total:</i>
              </b>{" "}
              {xpSummary.totalXP} XP
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
    return <SpiritCanvas render3d={this.render3d} />;
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
          height: DimensionController.getConsoleLayoutHeight(),
          opacity: 1
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection
                  .SPIRIT
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .SPIRIT
              }
              onClick={this.handleSpiritClick}
            />
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection
                  .BADGES
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .BADGES
              }
              onClick={this.handleBadgesClick}
            />
          </Menu>
          <Segment
            inverted
            className={"spiritContentWrapper"}
          >
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
