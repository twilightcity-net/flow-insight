import React, {Component} from "react";
import {Icon, List, Menu, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import {FlowClient} from "../../../../clients/FlowClient";
import * as d3 from "d3";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../clients/BaseClient";
/**
 * this component is the side panel for the individual's home page
 * when the FlowInsight for individuals mode is active
 */
export default class MePanel extends Component {
  /**
   * the graphical name of this component in the DOM
   * @type {string}
   */
  static className = "meContent";

  /**
   * builds the me panel
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[MePanel]";
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );
  }


  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
  loadState() {
    return {
      activeItem: SidePanelViewController.SubmenuSelection.ME,
      meVisible: false,
      animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
      animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
      title: "",
    };
  }

  /**
   * attach our listeners to this component from our controller class
   */
  componentDidMount = () => {
    console.log("MePanel mount!");
    this.myController.configureHomePanelListener(
      this,
      this.onRefreshMePanel
    );
    this.onRefreshMePanel();

    this.flowStateRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.FLOWSTATE_DATA_REFRESH,
        this,
        this.onFlowStateDataRefresh
      );

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
  };

  /**
   * When we get a flow state refresh, refresh our current state from the DB
   */
  onFlowStateDataRefresh() {
    console.log("On flow state data refresh");
    this.reloadFlowStateData();
  }

  /**
   * event handler that is called whenever we receive a talk message,
   * listen to self me-updates so we can updated our flow light (and potentially our name)
   * @param event`
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let mType = arg.messageType,
      memberId = arg.metaProps["from.member.id"],
      data = arg.data;

    if (mType === BaseClient.MessageTypes.TEAM_MEMBER) {
      let myId = MemberClient.me.id;
      if (memberId === myId) {
        this.setState({
          me: data
        })
      }
    }
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
    this.flowStateRefreshListener.clear();
    this.talkRoomMessageListener.clear();
    this.myController.configureHomePanelListener(
      this,
      null
    );
  };


  onRefreshMePanel = () => {
    MemberClient.getMe(this, (arg) => {
      if (arg.error) {
        console.error("Error while fetching me:"+ arg.error);
      } else {
        this.setState({
          me: arg.data,
          activeItem: SidePanelViewController.SubmenuSelection.ME,
          meVisible: true,
        });
      }
    } );

    this.reloadFlowStateData();
  }


  /**
   * updates display to show me content
   * @param e
   * @param name
   */
  handleMeClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      meVisible: true,
    });
  };


  getMyStatusBar() {
    let displayName = "";
    if (this.state.me) {
      displayName = this.state.me.displayName;
    }

    return (
      <div className={"meStatus"}>
        <div className="flow">
          <Icon className="flow" name="circle" style={{"color": this.getFlowLightColor()}} />
          <span className="flowLabel">Flow State:</span>
        </div>

        <div className="name">{displayName}</div>
      </div>
    );
  }

  /**
   * Get the color of the flow state based on momentum and whether we're in a troubleshooting session
   * @returns {string}
   */
  getFlowLightColor() {
    let color = "#ffffff";
    if (this.state.me && this.state.me.activeCircuit) {
      color = "#FF2C36";
    } else if (this.state.flowState) {
      let momentum = this.state.flowState.momentum;

      var interp = d3
        .scaleLinear()
        .domain([0, 0.2, 0.4, 1])
        .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

      let mScale = d3
        .scaleLinear()
        .domain([0, 200])
        .range([0, 1]);

      color = interp(mScale(momentum));
    }

    return color;
  }


  getMyActiveTask() {
    let activeTaskName = "";
    let activeTaskDescription = "";

    if (this.state.me) {
      activeTaskName = this.state.me.activeTaskName;
      activeTaskDescription = this.state.me.activeTaskSummary;
    }

    if (!activeTaskName) {
      return (<div></div>);
    } else {
      return (
        <div className={"meActiveTask"}>
          <div className="taskName">
            {activeTaskName}
          </div>
          <div className="description">
            {activeTaskDescription}
          </div>

          <div className="status">Active</div>
        </div>
      );
    }
  }

  /**
   * gets the me content panel for the sidebar
   * @returns {*}
   */
  getMeContent = () => {
    let content = "";

    content = (
      <div className={MePanel.className}>
        {this.getMyStatusBar()}
      </div>
    );

    return content;
  };


  /**
   * Reload the flow state momentum data that results in the color of the circle to update
   */
  reloadFlowStateData() {
    FlowClient.getMyFlowData(this, (arg) => {
      if (!arg.error) {
        if (!this.state.flowState || (this.state.flowState && arg.data.momentum !== this.state.flowState.momentum)) {
          console.log("Updating flow state momentum to "+arg.data.momentum);
          this.setState({
            flowState: arg.data
          });
        }
      } else {
        console.error(arg.error);
      }
    });
  }



  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel mePanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity,
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name="my status"
              active={true}
              onClick={this.handleMeClick}
            />
          </Menu>
          <Segment
            inverted
            style={{
              height: DimensionController.getSidebarPanelHeight(),
            }}
          >
            <Transition
              visible={this.state.meVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getMeContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
