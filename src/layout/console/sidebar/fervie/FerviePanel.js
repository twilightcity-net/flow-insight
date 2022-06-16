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

    this.whatToColorOptions = [
      {
        key: 0,
        value: FerviePanel.Colorables.FUR,
        text: FerviePanel.Colorables.FUR,
      },
      {
        key: 1,
        value: FerviePanel.Colorables.SHOES,
        text: FerviePanel.Colorables.SHOES,
      },
      {
        key: 2,
        value: FerviePanel.Colorables.ACCESSORY,
        text: FerviePanel.Colorables.ACCESSORY,
      },
    ];

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

  static get Colorables() {
    return {
      FUR: "Fur",
      SHOES: "Shoes",
      ACCESSORY: "Accessory",
    };
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

    if (fervieColor === undefined || fervieColor === null) {
      fervieColor = "#B042FF";
    }

    if (fervieSecondaryColor === undefined || fervieSecondaryColor === null) {
      fervieSecondaryColor = "#FFFFFF";
    }

    if (fervieTertiaryColor === undefined || fervieTertiaryColor === null) {
      fervieTertiaryColor = "#000000";
    }

    return {
      activeItem: SidePanelViewController.SubmenuSelection.FERVIE,
      fervieVisible: false,
      skillsVisible: false,
      badgesVisible: false,
      accessoriesVisible: false,
      xpSummary: me.xpSummary,
      pickColorVisible: false,
      color: fervieColor,
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor,
      fervieAccessory: fervieAccessory,
      editedFervieColor: fervieColor,
      editedFervieSecondaryColor: fervieSecondaryColor,
      editedfervieTertiaryColor: fervieTertiaryColor,
      whatToColor: FerviePanel.Colorables.FUR,
      isEditingName: false,
      fervieName: this.getFervieName(me),
      currentFervieName:  this.getFervieName(me),
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

    if (fervieColor === undefined || fervieColor === null) {
      fervieColor = "#B042FF";
    }

    if (fervieSecondaryColor === undefined || fervieSecondaryColor === null) {
      fervieSecondaryColor = "#FFFFFF";
    }

    if (fervieTertiaryColor === undefined || fervieTertiaryColor === null) {
      fervieTertiaryColor = "#000000";
    }

    return {
      xpSummary: me.xpSummary,
      color: fervieColor,
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor,
      fervieAccessory: fervieAccessory,
      editedFervieColor: fervieColor,
      editedFervieSecondaryColor: fervieSecondaryColor,
      editedfervieTertiaryColor: fervieTertiaryColor,
      whatToColor: FerviePanel.Colorables.FUR,
      fervieName: this.getFervieName(me),
      currentFervieName:  this.getFervieName(me),
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
      skillsVisible: false,
      accessoriesVisible: true
    });
  }

  /**
   * shows the skills or accessories panel based on feature flag options
   */
  showSkillsOrAccessoriesPanel() {
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

  handleGlubalHudInputUnlock = () => {
    this.globalHudInputLockNotifier.dispatch({lockInput: false});
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
          height: 443,
        }}
      >
        <i>Check back later :)</i>
      </div>
    );
  };

  onSunglassesClick = (itemComp) => {
      this.setState((prevState) => {
        if (prevState.fervieAccessory === itemComp.props.fervieAccessory) {
          this.saveFervieDetailsToServer(
            this.state.fervieColor,
            this.state.fervieSecondaryColor,
            null,
            null,
            this.state.fervieName
          );
          return {
            fervieAccessory: null,
            fervieTertiaryColor: null,
          };
        } else {
          this.saveFervieDetailsToServer(
            this.state.fervieColor,
            this.state.fervieSecondaryColor,
            "#000000",
            itemComp.props.fervieAccessory,
            this.state.fervieName
          );

          return {
            fervieAccessory: itemComp.props.fervieAccessory,
            fervieTertiaryColor: "#000000"
          };
        }
      });
  }

  onHeartGlassesClick = (itemComp) => {
    this.setState((prevState) => {
      if (prevState.fervieAccessory === itemComp.props.fervieAccessory) {
        this.saveFervieDetailsToServer(
          this.state.fervieColor,
          this.state.fervieSecondaryColor,
          null,
          null,
          this.state.fervieName
        );
        return {
          fervieAccessory: null,
          fervieTertiaryColor: null,
        };
      } else {
        this.saveFervieDetailsToServer(
          this.state.fervieColor,
          this.state.fervieSecondaryColor,
          "#A12E79",
          itemComp.props.fervieAccessory,
          this.state.fervieName
        );
        return {
          fervieAccessory:
          itemComp.props.fervieAccessory,
          fervieTertiaryColor: "#A12E79",
        };
      }
    });
  }


  /**
   * gets the accessories content panel for the sidebar
   * @returns {*}
   */
  getAccessoriesContent = () => {
    return (
      <div
        className="fervieSkillsContent"
        style={{
          height: 443,
        }}
      >
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <AccessoryListItem
            idkey={"1"}
            isActive={this.state.fervieAccessory === "SUNGLASSES"}
            moovieWatchCount={this.state.moovieWatchCount}
            moovieWatchCountRequired={5}
            skillName={"Neo Shades"}
            skillEffect={
              "Express your inner Neo.  If Neo can do it, so can Fervies."
            }
            accessoryName={"Sunglasses"}
            fervieAccessory={"SUNGLASSES"}
            onSkillItemClick={this.onSunglassesClick}
          />
          <AccessoryListItem
            idkey={"2"}
            isActive={this.state.fervieAccessory === "HEARTGLASSES"}
            moovieWatchCount={this.state.moovieWatchCount}
            moovieWatchCountRequired={5}
            skillName={"Heart Shades"}
            skillEffect={
              "The perfect shades for making friends at the moovies."
            }
            accessoryName={"Sunglasses"}
            fervieAccessory={"HEARTGLASSES"}
            onSkillItemClick={this.onHeartGlassesClick}
          />
        </List>
      </div>
    );
  };

  /**
   * gets the skills content panel for the sidebar
   * @returns {*}
   */
  getSkillsContent = () => {
    return (
      <div
        className="fervieSkillsContent"
        style={{
          height: 443,
        }}
      >
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <SkillListItem
            idkey={"1"}
            isActive={this.state.fervieAccessory === "SUNGLASSES"}
            skillName={"Fervie Neo"}
            skillEffect={
              "Earn 10% bonus XP while you learn the command line tools, and receive badges for exploring new commands"
            }
            skillBonus={"+10% bonus XP"}
            currentLevel={this.state.xpSummary.level}
            skillLevelRequired={7}
            xpToLevel={this.state.xpSummary.xpRequiredToLevel}
            accessoryName={"Sunglasses"}
            fervieAccessory={"SUNGLASSES"}
            onSkillItemClick={this.onSunglassesClick}
          />
          <SkillListItem
            idkey={"2"}
            isActive={this.state.fervieAccessory === "HEARTGLASSES"}
            skillName={"Fervie Love"}
            skillEffect={
              "Earn 10% bonus XP when you help your teammates troubleshoot, and receive badges for helping out"
            }
            skillBonus={"+10% bonus XP"}
            currentLevel={this.state.xpSummary.level}
            skillLevelRequired={7}
            xpToLevel={this.state.xpSummary.xpRequiredToLevel}
            accessoryName={"Sunglasses"}
            fervieAccessory={"HEARTGLASSES"}
            onSkillItemClick={this.onHeartGlassesClick}
          />
        </List>
      </div>
    );
  };

  onStartEditing = () => {
    console.log("editing!");
    this.setState({
      isEditingName: true
    });
  }

  /**
   * When we hit the enter key, should accept the new fervie name
   * @param e
   */
  handleKeyPressForNameChange = (e) => {
    if (e.charCode === 13) {
      this.setState((prevState) => {

        this.saveFervieDetailsToServer(
          this.state.fervieColor,
          this.state.fervieSecondaryColor,
          this.state.fervieTertiaryColor,
          this.state.fervieAccessory,
          prevState.currentFervieName
        );

        return {
          isEditingName: false,
          fervieName: prevState.currentFervieName
        }
      });
      this.handleGlubalHudInputUnlock();
    }

  };

  /**
   * Handles blurring (cancelling) of our name change
   */
  handleNameChangeBlur = () => {
    this.setState((prevState) => {
      return {
        isEditingName: false,
        currentFervieName: prevState.fervieName
      }
    });
    this.handleGlubalHudInputUnlock();
  };

  /**
   * Handles blurring (cancelling) of our name change
   */
  handleNameChangeFocus = () => {
    this.handleGlobalHudInputLock();
  };

  /**
   * Handles our editing of the fervie name
   * @param e - the event that was generated by user gui event
   * @param value
   */
  handleChangeForNameChange = (e, { value }) => {
    this.setState({
      currentFervieName: value,
    });
  };

  /**
   * renders the moovie version of fervie title content
   * @returns {*}
   */
  getMoovieFervieTitle = () => {
    let displayName = this.state.fervieName;
    if (!displayName) {
      displayName = "Your Fervie";
    }

    if (!this.state.isEditingName) {
      return (<Popup
        trigger={
          <div className="fervieName" onClick={this.onStartEditing}>
            {displayName}
          </div>}
        content={"Click to edit name"}
        position="bottom center"
        inverted
        hideOnScroll
      />);
    } else {
      return (<Input
        id="fervieNameInput"
        className="fervieNameInput"
        fluid
        inverted
        placeholder="Name your Fervie"
        value={this.state.currentFervieName}
        onKeyPress={this.handleKeyPressForNameChange}
        onChange={this.handleChangeForNameChange}
        onBlur={this.handleNameChangeBlur}
        onFocus={this.handleNameChangeFocus}
        autoFocus
      />)
    }



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
      ),
      xpDisplay = UtilRenderer.getXpDetailDisplay(
        this.state.xpSummary
      );

    return (
      <div className="fervieTitle">
        <div className="level">
          <div className="infoTitle">
            {displayName}
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
            <div className="xpCount">{xpDisplay}</div>
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
      <div
        style={{
          height:
            DimensionController.getFervieCanvasHeight(),
          width: DimensionController.getFervieCanvasWidth(),
        }}
      >
        <FervieCanvas
          haircolor={this.state.fervieColor}
          shoecolor={this.state.fervieSecondaryColor}
          accessorycolor={this.state.fervieTertiaryColor}
          accessory={this.state.fervieAccessory}
          render3d={this.render3d}
        />
      </div>
    );
  };

  handleChooseColorOnClick = () => {
    this.setState({
      pickColorVisible: true,
      editedFervieColor: this.state.fervieColor,
      editedFervieSecondaryColor: this.state.fervieSecondaryColor,
      editedFervieTertiaryColor: this.state.fervieTertiaryColor,
      whatToColor : FerviePanel.Colorables.FUR,
      color: this.state.fervieColor
    });
  };

  handleCancelColorClick = () => {
    this.setState({
      pickColorVisible: false
    });
  }

  /**
   * When color change is done, save the details on the server
   */
  handleColorDoneOnClick = () => {
    let fervieColor = this.state.editedFervieColor;
    let fervieSecondaryColor = this.state.editedFervieSecondaryColor;
    let fervieTertiaryColor = this.state.editedFervieTertiaryColor;

    //make sure we apply the last color setting, and figure out what needs to be sent to server
    if (this.state.whatToColor === FerviePanel.Colorables.FUR) {
      fervieColor = this.state.color;
      this.setState({
        editedFervieColor: this.state.color,
        fervieColor: this.state.color,
      });
    } else if (this.state.whatToColor === FerviePanel.Colorables.SHOES) {
      fervieSecondaryColor = this.state.color;
      this.setState({
        editedFervieSecondaryColor: this.state.color,
        fervieSecondaryColor: this.state.color,
      });
    } else if (this.state.whatToColor === FerviePanel.Colorables.ACCESSORY) {
      fervieTertiaryColor = this.state.color;
      this.setState({
        editedFervieTertiaryColor: this.state.color,
        fervieTertiaryColor: this.state.color,
      });
    }

    this.setState({
      pickColorVisible: false,
      fervieColor: fervieColor,
      fervieSecondaryColor: fervieSecondaryColor,
      fervieTertiaryColor: fervieTertiaryColor
    });
    FervieClient.saveFervieDetails(
      fervieColor,
      fervieSecondaryColor,
      fervieTertiaryColor,
      this.state.fervieAccessory,
      this.state.fervieName,
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

  handleChangeForWhatToColor = (e, { value }) => {
    //when its changed, whatever the color was set to for the prior color, need to save this
    if (this.state.whatToColor === FerviePanel.Colorables.FUR) {
      //existing color state, we need to copy out to the particular variable type
      this.setState({
        editedFervieColor: this.state.color,
      });
    } else if (this.state.whatToColor === FerviePanel.Colorables.SHOES) {
      this.setState({
        editedFervieSecondaryColor: this.state.color,
      });
    } else if (this.state.whatToColor === FerviePanel.Colorables.ACCESSORY) {
      this.setState({
        editedFervieTertiaryColor: this.state.color,
      });
    }

    let newColor = null;
    if (value === FerviePanel.Colorables.FUR) {
      newColor = this.state.editedFervieColor;
    } else if (value === FerviePanel.Colorables.SHOES) {
      newColor = this.state.editedFervieSecondaryColor;
    } else if (value === FerviePanel.Colorables.ACCESSORY) {
      newColor = this.state.editedFervieTertiaryColor;
    }

    this.setState({
      color: newColor,
      whatToColor: value,
    });
  };

  /**
   * gets button panel below our fervie
   * @returns {*}
   */
  getFervieButtonPanel = () => {
    return (
      <div className="fervieButtons">
        <Button
          icon
          size="mini"
          color="violet"
          onClick={() => {
            this.showSkillsOrAccessoriesPanel();
          }}
        >
          <Icon name="gem outline" />
        </Button>
        <Button
          onClick={this.handleChooseColorOnClick}
          size="mini"
          color="violet"
        >
          Choose Colors
        </Button>
      </div>
    );
  };

  /**
   * gets button panel when color picker is open
   * @returns {*}
   */
  getColorPickerButtonPanel = () => {
    return (
      <div className="fervieColorButtons">
        <Button
          className="cancelButton"
          onClick={this.handleCancelColorClick}
          size="mini"
          color="grey"
        >
          Cancel
        </Button>
        <Button
          className="okayButton"
          onClick={this.handleColorDoneOnClick}
          size="mini"
          color="violet"
        >
          Okay
        </Button>
      </div>
    );
  };

  getColorPickerFervieContent() {
    let whatToColorAvailable = [];

    whatToColorAvailable.push(this.whatToColorOptions[0]);
    whatToColorAvailable.push(this.whatToColorOptions[1]);
    if (this.state.fervieAccessory) {
      whatToColorAvailable.push(this.whatToColorOptions[2]);
    }

    return (
      <div className="fervieContent">
        <div className="chooseColors">
          <b>Choose Colors</b>
        </div>

        <div
          style={{
            margin: "auto",
            height: DimensionController.getMiniFervieCanvasHeight(),
            width: DimensionController.getMiniFervieCanvasWidth(),
          }}
        >
          <FervieCanvas
            haircolor={this.state.editedFervieColor}
            shoecolor={this.state.editedFervieSecondaryColor}
            accessorycolor={this.state.editedFervieTertiaryColor}
            accessory={this.state.fervieAccessory}
            render3d={this.render3d}
          />
        </div>

        <div>
          <Dropdown
            id="whatToColor"
            className="whatToColor"
            placeholder="Choose what to color"
            options={whatToColorAvailable}
            selection
            fluid
            upward
            value={this.state.whatToColor}
            onChange={this.handleChangeForWhatToColor}
          />
        </div>

        <div
          style={{
            height: DimensionController.getColorPickerDivHeight(),
          }}
        >
          <HexColorPicker
            color={this.state.color}
            onChange={(color) => {
              if (this.state.whatToColor === FerviePanel.Colorables.FUR) {
                this.setState({
                  color: color,
                  editedFervieColor: color,
                });
              } else if (this.state.whatToColor === FerviePanel.Colorables.SHOES) {
                this.setState({
                  color: color,
                  editedFervieSecondaryColor: color,
                });
              } else if (this.state.whatToColor === FerviePanel.Colorables.ACCESSORY) {
                this.setState({
                  color: color,
                  editedFervieTertiaryColor: color,
                });
              }
            }}
          />
        </div>
        {this.getColorPickerButtonPanel()}
      </div>
    );
  }

  getNormalFervieContent() {

    let fervieTitle;
    if (FeatureToggle.isMoovieApp) {
      fervieTitle = this.getMoovieFervieTitle();
    } else {
      fervieTitle = this.getFervieTitle();
    }

    return (
      <div className="fervieContent">
        {fervieTitle}
        {this.getFervieCanvas()}
        {this.getFervieButtonPanel()}
      </div>
    );
  }

  /**
   * renders the fervie part of the panel
   * @returns {*}
   */
  getFervieContent = () => {
    if (this.state.pickColorVisible === false) {
      return this.getNormalFervieContent();
    } else {
      return this.getColorPickerFervieContent();
    }
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



  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

    const fervieContent = this.getFervieContent();
    const badgesContent = this.getBadgesContent();
    const skillsContent = this.getSkillsContent();
    const accessoriesContent = this.getAccessoriesContent();

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
              {skillsContent}
            </Transition>
            <Transition
              visible={this.state.accessoriesVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {accessoriesContent}
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
