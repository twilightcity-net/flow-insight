import React, { Component } from "react";
import {
    Button,
    Menu,
    Popup,
    Progress,
    Segment,
    Transition
} from "semantic-ui-react";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import FervieCanvas from "./FervieCanvas";
import { DimensionController } from "../../../../controllers/DimensionController";
import { MemberClient } from "../../../../clients/MemberClient";
import UtilRenderer from "../../../../UtilRenderer";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";
import { BaseClient } from "../../../../clients/BaseClient";
import { HexColorPicker } from "react-colorful";
import {FervieClient} from "../../../../clients/FervieClient";
/**
 * this class is responsible for storing the users fervie avatar, xp, inventory,
 * and accessories. Currently this only uses a simple canvas but will use
 * an embedded unity3d instance
 */
export default class FerviePanel extends Component {
  /**
   * the constructor function which is used to build the fervie panel
   * @param props - these are the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[FerviePanel]";
    this.render3d = false;
    this.animationType =
      SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay =
      SidePanelViewController.AnimationDelays.SUBMENU;
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );

    let fervieColor = MemberClient.me.fervieColor;
    if (fervieColor === undefined || fervieColor === null) {
      fervieColor = "#B042FF";
    }
    this.state = {
      activeItem:
        SidePanelViewController.SubmenuSelection.FERVIE,
      fervieVisible: false,
      badgesVisible: false,
      xpSummary: MemberClient.me.xpSummary,
      pickColorVisible: false,
      color: fervieColor
    };
    this.me = MemberClient.me;

    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
  }

  /**
   * event handler for talk messages. This is called everytime we receive a new talk
   * message over the event bus. If we get XP updates for our fervie, we want to update
   * our xp bar in the panel
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    switch (arg.messageType) {
      case BaseClient.MessageTypes.XP_STATUS_UPDATE:
        return this.handleXPUpdateMessage(arg);
      default:
        return;
    }
  };

  /**
   * processes our xp status update event which is used to update
   * our fervie's xp bar
   * @param arg
   */
  handleXPUpdateMessage(arg) {
    let data = arg.data;

    this.setState({
      xpSummary: data.newXPSummary
    });
  }

  /**
   * thew function that is called to open and display the badges panel in the side
   */
  showFerviePanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.FERVIE,
      fervieVisible: true,
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
      fervieVisible: false,
      badgesVisible: true
    });
  }

  /**
   * updates display to show fervie content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleFervieClick = (e, { name }) => {
    this.myController.changeActiveFervieSubmenuPanel(name);
  };

  /**
   * updates the display to show the badges content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleBadgesClick = (e, { name }) => {
    this.myController.changeActiveFervieSubmenuPanel(name);
  };

  /**
   * called after the component mounds and then notifies the perspective
   * controller to refresh the view
   */
  componentDidMount = () => {
    this.myController.configureFerviePanelListener(
      this,
      this.onRefreshFerviePanel
    );
    this.onRefreshFerviePanel();
  };

  /**
   * event listener that is notified when the perspective changes views
   */
  onRefreshFerviePanel() {
    this.me = MemberClient.me;
    switch (
      this.myController.activeFervieSubmenuSelection
    ) {
      case SidePanelViewController.SubmenuSelection.FERVIE:
        this.showFerviePanel();
        break;
      case SidePanelViewController.SubmenuSelection.BADGES:
        this.showBadgesPanel();
        break;
      default:
        throw new Error(
          "Unknown fervie panel type '" +
            this.myController.activeFervieSubmenuSelection +
            "'"
        );
    }
  }

  /**
   * called right before the component will mount. This will clear the listeners callback
   */
  componentWillUnmount() {
    this.myController.configureFerviePanelListener(
      this,
      null
    );
    this.talkRoomMessageListener.clear();
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
   * renders the fervie title content for the panel
   * @returns {*}
   */
  getFervieTitle = () => {
    let displayName = "Your Fervie", //this.me.displayName,
      xpPercent = UtilRenderer.getXpPercent(
        this.state.xpSummary.xpProgress,
        this.state.xpSummary.xpRequiredToLevel
      );

    return (
      <div className="fervieTitle">
        <div className="level">
          <div className="infoTitle">
            <b>{displayName}</b>
          </div>
          <div className="infoLevel">
            <b>Level {this.state.xpSummary.level} </b>
            <br />
            <i>({this.state.xpSummary.title})</i>
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
              {this.state.xpSummary.totalXP} XP
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
   * gets a 2d canvas to draw our fervie on
   * @returns {*}
   */
  getFervieCanvas = () => {
    return (
        <div style={{
                  height:
                      DimensionController.getConsoleLayoutHeight() -
                      118
              }} >
            <FervieCanvas haircolor={this.state.color} render3d={this.render3d} />
        </div>
        );
  };

  handleChooseColorOnClick = () => {
    this.setState({pickColorVisible: true});
  };

    /**
     * When color change is done, save the details on the server
     */
    handleColorDoneOnClick = () => {
        this.setState({pickColorVisible: false});
        FervieClient.saveFervieDetails(
            this.state.color,
            null,
            null,
            null,
            this,
            arg => {
                if (!arg.error && arg.data) {
                    console.log("Saved");
                } else {
                    console.error("Error: "+arg.error);
                }
            }
        );
    };

  /**
   * gets button panel below our fervie
   * @returns {*}
   */
  getFervieButtonPanel = () => {
      return <div className="fervieButtons">
          <Button
              onClick={this.handleChooseColorOnClick}
              size="mini"
              color="violet"
          >
              Choose Color
          </Button>
      </div>;
  };

    /**
     * gets button panel when color picker is open
     * @returns {*}
     */
    getColorPickerButtonPanel = () => {
        return <div className="fervieButtons">
            <Button
                onClick={this.handleColorDoneOnClick}
                size="mini"
                color="violet"
            >
                Okay
            </Button>
        </div>;
    };



  /**
   * renders the parts of the component together
   * @returns {*}
   */
  getFervieContent = () => {
    if (this.state.pickColorVisible === false) {
      return this.getNormalFervieContent();
    } else {
      return this.getColorPickerFervieContent();
    }
  };

  getNormalFervieContent() {
    return (
        <div className="fervieContent">
            {this.getFervieTitle()}
            {this.getFervieCanvas()}
            {this.getFervieButtonPanel()}
        </div>
    );
  }

  getColorPickerFervieContent() {
    return (
        <div className="fervieContent">
            {this.getFervieTitle()}
            <HexColorPicker color={this.state.color} onChange={(color) => {
                this.setState( {color: color});
            }}/>
            {/*<div style={{*/}
                {/*height:*/}
                    {/*DimensionController.getConsoleLayoutHeight() -*/}
                    {/*250*/}
            {/*}} >*/}
                {/*<FervieCanvas render3d={this.render3d} />*/}
            {/*</div>*/}
            {this.getColorPickerButtonPanel()}
        </div>
    );
  }

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

    const fervieContent = this.getFervieContent();
    const badgesContent = this.getBadgesContent();

    return (
      <div
        id="component"
        className="consoleSidebarPanel ferviePanel"
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
                  .FERVIE
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .FERVIE
              }
              onClick={this.handleFervieClick}
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
            className={"fervieContentWrapper"}
          >
            <Transition
              visible={this.state.fervieVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {fervieContent}
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
