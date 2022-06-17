import React, { Component } from "react";
import {
  Button,
  Dropdown,
  Icon, Input,
  List,
  Menu,
  Popup,
  Progress,
  Segment,
  Transition,
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
import { FervieClient } from "../../../../clients/FervieClient";
import SkillListItem from "./SkillListItem";
import FeatureToggle from "../../../shared/FeatureToggle";
import AccessoryListItem from "./AccessoryListItem";
import SkillsAccessoriesContent from "./SkillsAccessoriesContent";
import FervieColors from "../../content/support/FervieColors";
import FervieContent from "./FervieContent";
import BadgesContent from "./BadgesContent";
import AccountContent from "./AccountContent";
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
    this.me = MemberClient.me;

    this.state = this.createInitialState(this.me);

    this.render3d = false;
    this.animationType = SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay = SidePanelViewController.AnimationDelays.SUBMENU;
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.meDataRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.ME_DATA_REFRESH,
        this,
        this.onMeRefresh
      );
  }

  getFervieName(me) {
    if (me && me.fervieName) {
      return me.fervieName;
    } else {
      return "";
    }
  }

  /**
   * Force refresh of me object that happens on disconnect and refresh
   */
  onMeRefresh() {
    MemberClient.getMe(this, (arg) => {
      this.me = arg.data;
      this.setState(this.createMeStateUpdate(this.me));
      this.onRefreshFerviePanel();
    });
  }


  /**
   * Take all the color and property info out of the passed in me,
   * and return as a property set for updating the state
   * @param me
   */
  createInitialState(me) {

    let fervieColor = me.fervieColor;
    let fervieSecondaryColor = me.fervieSecondaryColor;
    let fervieTertiaryColor = me.fervieTertiaryColor;
    let fervieAccessory = me.fervieAccessory;

    if (fervieColor === null || fervieColor === undefined) {
      fervieColor = FervieColors.defaultFervieColor;
    }

    if (fervieSecondaryColor === null || fervieSecondaryColor === undefined) {
      fervieSecondaryColor = FervieColors.defaultShoeColor;
    }

    if (fervieTertiaryColor === null || fervieTertiaryColor === undefined) {
      fervieTertiaryColor = FervieColors.defaultSunglassColor;
    }

    return {
      activeItem: SidePanelViewController.SubmenuSelection.FERVIE,
      fervieVisible: false,
      skillsVisible: false,
      badgesVisible: false,
      accountVisible: false,
      accessoriesVisible: false,
      xpSummary: me.xpSummary,
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor,
      fervieAccessory: fervieAccessory,
      fervieName: this.getFervieName(me),
      moovieWatchCount : me.moovieCount
    };

  }

  /**
   * Create state update just for fervie me properties
   * @param me
   */
  createMeStateUpdate(me) {

    let fervieColor = me.fervieColor;
    let fervieSecondaryColor = me.fervieSecondaryColor;
    let fervieTertiaryColor = me.fervieTertiaryColor;
    let fervieAccessory = me.fervieAccessory;

    if (fervieColor === null || fervieColor === undefined) {
      fervieColor = FervieColors.defaultFervieColor;
    }

    if (fervieSecondaryColor === null || fervieSecondaryColor === undefined) {
      fervieSecondaryColor = FervieColors.defaultShoeColor;
    }

    if (fervieTertiaryColor === null || fervieTertiaryColor === undefined) {
      fervieTertiaryColor = FervieColors.defaultSunglassColor;
    }

    return {
      xpSummary: me.xpSummary,
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor,
      fervieAccessory: fervieAccessory,
      fervieName: this.getFervieName(me),
      moovieWatchCount : me.moovieCount
    };

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

    if (this.isMe(data.memberId)) {
      this.setState({
        xpSummary: data.newXPSummary,
      });
    }
  }

  /**
   * checks to see if this is use based on a member id
   * @param id
   * @returns {boolean}
   */
  isMe(id) {
    let me = this.me;
    return me && me["id"] === id;
  }

  /**
   * thew function that is called to open and display the badges panel in the side
   */
  showFerviePanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.FERVIE,
      fervieVisible: true,
      badgesVisible: false,
      accountVisible: false,
      skillsVisible: false,
      accessoriesVisible: false
    });
  }

  /**
   * the function that is called to open and display the badges panel in the side
   */
  showBadgesPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BADGES,
      fervieVisible: false,
      badgesVisible: true,
      accountVisible: false,
      skillsVisible: false,
      accessoriesVisible: false
    });
  }


  /**
   * the function that is called to open and display the badges panel in the side
   */
  showAccountPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.ACCOUNT,
      fervieVisible: false,
      badgesVisible: false,
      accountVisible: true,
      skillsVisible: false,
      accessoriesVisible: false
    });
  }

  /**
   * the function that is called to open and display the skills panel in the side
   */
  showSkillsPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.SKILLS,
      fervieVisible: false,
      badgesVisible: false,
      accountVisible: false,
      skillsVisible: true,
      accessoriesVisible: false
    });
  }

  /**
   * the function that is called to open and display the skills panel in the side
   */
  showAccessoriesPanel() {
    console.log("setting active item to accessories!");
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.ACCESSORIES,
      fervieVisible: false,
      badgesVisible: false,
      accountVisible: false,
      skillsVisible: false,
      accessoriesVisible: true
    });
  }

  /**
   * shows the skills or accessories panel based on feature flag options
   */
  gotoSkillsOrAccessoriesPanel = () => {
    if (FeatureToggle.isMoovieApp) {
      this.showAccessoriesPanel();
    } else {
      this.showSkillsPanel();
    }
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
   * updates the display to show the skills content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleSkillsClick = (e, { name }) => {
    this.myController.changeActiveFervieSubmenuPanel(name);
  };


  /**
   * updates the display to show the accessories content
   * @param e - the menu event that was dispatched
   * @param name - the name of the menu that was clicked
   */
  handleAccessoriesClick = (e, { name }) => {
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

    FervieClient.getBuddyMe(this, (arg) => {
      if (!arg.error) {
        this.me = arg.data;
        this.setState(this.createMeStateUpdate(this.me));
      }
    });

    this.globalHudInputLockNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.GLOBAL_HUD_INPUT_LOCK,
        this
      );
  };

  /**
   * event listener that is notified when the perspective changes views
   */
  onRefreshFerviePanel() {
    switch (
      this.myController.activeFervieSubmenuSelection
    ) {
      case SidePanelViewController.SubmenuSelection.FERVIE:
        this.showFerviePanel();
        break;
      case SidePanelViewController.SubmenuSelection.BADGES:
        this.showBadgesPanel();
        break;
      case SidePanelViewController.SubmenuSelection.ACCOUNT:
        this.showAccountPanel();
        break;
      case SidePanelViewController.SubmenuSelection.SKILLS:
        this.showSkillsPanel();
        break;
      case SidePanelViewController.SubmenuSelection.ACCESSORIES:
        this.showAccessoriesPanel();
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
    this.meDataRefreshListener.clear();
  }

  handleGlobalHudInputLock = () => {
    this.globalHudInputLockNotifier.dispatch({lockInput: true});
  }

  handleGlobalHudInputUnlock = () => {
    this.globalHudInputLockNotifier.dispatch({lockInput: false});
  }


  /**
   * Update the accessory and the accessory color based on a click
   * @param fervieAccessory
   * @param accessoryColor
   */
  onUpdateAccessory = (fervieAccessory, accessoryColor) => {
    this.saveFervieDetailsToServer(
      this.state.fervieColor,
      this.state.fervieSecondaryColor,
      accessoryColor,
      fervieAccessory,
      this.state.fervieName);

    this.setState({
      fervieAccessory: fervieAccessory,
      fervieTertiaryColor: accessoryColor
    });
  }

  /**
   * Update the fervieName
   * @param fervieName
   */
  onUpdateFervieName = (fervieName) => {
    this.saveFervieDetailsToServer(
      this.state.fervieColor,
      this.state.fervieSecondaryColor,
      this.state.fervieTertiaryColor,
      this.state.fervieAccessory,
      fervieName);

    this.setState({
      fervieName: fervieName
    });
  }

  /**
   * Update the colors of the fervie
   * @param fervieColor
   * @param fervieSecondaryColor
   * @param fervieTertiaryColor
   */
  onUpdateFervieColors = (fervieColor, fervieSecondaryColor, fervieTertiaryColor) => {
    this.saveFervieDetailsToServer(
      fervieColor,
      fervieSecondaryColor,
      fervieTertiaryColor,
      this.state.fervieAccessory,
      this.state.fervieName);

    this.setState({
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor
    });
  }

  /**
   * When accessory skill is chosen, save changes to the server
   */
  saveFervieDetailsToServer = (
    fervieColor,
    secondaryColor,
    tertiaryColor,
    accessory,
    fervieName
  ) => {
    FervieClient.saveFervieDetails(
      fervieColor,
      secondaryColor,
      tertiaryColor,
      accessory,
      fervieName,
      this,
      (arg) => {
        if (!arg.error && arg.data) {
          console.log("Saved");
        } else {
          console.error("Error: " + arg.error);
        }
      }
    );
  };


  getFervieMenuItem(activeItem) {
    return (
      <Menu.Item
        name={SidePanelViewController.SubmenuSelection.FERVIE}
        active={activeItem === SidePanelViewController.SubmenuSelection.FERVIE}
        onClick={this.handleFervieClick}
      />
    );
  }

  getSkillsMenuItem(activeItem) {
    if (FeatureToggle.isMoovieApp) return "";
    return (
      <Menu.Item
      name={SidePanelViewController.SubmenuSelection.SKILLS}
      active={activeItem === SidePanelViewController.SubmenuSelection.SKILLS}
      onClick={this.handleSkillsClick}
    />
    );
  }

  getAccessoriesMenuItem(activeItem) {
    if (FeatureToggle.isFlowInsightApp()) return "";
    return (
      <Menu.Item
        name={SidePanelViewController.SubmenuSelection.ACCESSORIES}
        active={activeItem === SidePanelViewController.SubmenuSelection.ACCESSORIES}
        onClick={this.handleAccessoriesClick}
      />
    );
  }

  getBadgesMenuItem(activeItem) {
    return (
      <Menu.Item
        name={SidePanelViewController.SubmenuSelection.BADGES}
        active={activeItem === SidePanelViewController.SubmenuSelection.BADGES}
        onClick={this.handleBadgesClick}
      />
    );
  }

  getAccountMenuItem(activeItem) {
    return (
      <Menu.Item
        name={SidePanelViewController.SubmenuSelection.ACCOUNT}
        active={activeItem === SidePanelViewController.SubmenuSelection.ACCOUNT}
        onClick={this.handleBadgesClick}
      />
    );
  }



  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

    const fervieContent = <FervieContent fervieColor={this.state.fervieColor}
                                         fervieSecondaryColor={this.state.fervieSecondaryColor}
                                         fervieTertiaryColor={this.state.fervieTertiaryColor}
                                         fervieAccessory={this.state.fervieAccessory}
                                         xpSummary={this.state.xpSummary}
                                         fervieName={this.state.fervieName}
                                         onUpdateFervieName={this.onUpdateFervieName}
                                         onUpdateFervieColors={this.onUpdateFervieColors}
                                         handleGlobalHudInputUnlock={this.handleGlobalHudInputUnlock}
                                         handleGlobalHudInputLock={this.handleGlobalHudInputLock}
                                         gotoSkillsOrAccessoriesPanel={this.gotoSkillsOrAccessoriesPanel}/>
    const badgesContent = <BadgesContent />;
    const skillsContent = <SkillsAccessoriesContent type="skills"
                                                    fervieAccessory={this.state.fervieAccessory}
                                                    xpSummary={this.state.xpSummary}
                                                    moovieWatchCount={this.state.moovieWatchCount}
                                                    onUpdateAccessory={this.onUpdateAccessory}/>;
    const accessoriesContent = <SkillsAccessoriesContent type="accessories"
                                                         fervieAccessory={this.state.fervieAccessory}
                                                         xpSummary={this.state.xpSummary}
                                                         moovieWatchCount={this.state.moovieWatchCount}
                                                         onUpdateAccessory={this.onUpdateAccessory}/>;
    const accountContent = <AccountContent />;

    return (
      <div
        id="component"
        className="consoleSidebarPanel ferviePanel"
        style={{
          width: "100%",
          height: DimensionController.getConsoleLayoutHeight(),
          opacity: 1,
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            {this.getFervieMenuItem(activeItem)}
            {this.getSkillsMenuItem(activeItem)}
            {this.getAccessoriesMenuItem(activeItem)}
            {this.getBadgesMenuItem(activeItem)}
            {this.getAccountMenuItem(activeItem)}
          </Menu>
          <Segment
            inverted
            className={"fervieContentWrapper"}
            style={{
              height:
                DimensionController.getConsoleLayoutHeight(),
            }}
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
              visible={this.state.skillsVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              <div>
              {skillsContent}
              </div>
            </Transition>
            <Transition
              visible={this.state.accessoriesVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              <div>
              {accessoriesContent}
              </div>
            </Transition>
            <Transition
              visible={this.state.badgesVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              <div>
              {badgesContent}
              </div>
            </Transition>
            <Transition
              visible={this.state.accountVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              <div>
              {accountContent}
              </div>
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
